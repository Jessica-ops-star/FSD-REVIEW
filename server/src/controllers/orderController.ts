import { Response } from 'express';
import Order, { OrderStatus } from '../models/Order';
import MenuItem from '../models/MenuItem';
import Cart from '../models/Cart';
import Payment from '../models/Payment';
import Delivery from '../models/Delivery';
import Restaurant from '../models/Restaurant';
import { AuthRequest } from '../middleware/authMiddleware';
import { notifyOrderCreated, notifyOrderStatusUpdated } from '../socket/socketManager';

// Helper to generate readable order number e.g. ORD-1024
const generateOrderNumber = (): string => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${randomDigits}`;
};

// Valid status transition rules
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['PICKED_UP', 'OUT_FOR_DELIVERY'],
  PICKED_UP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Role permissions for status transitions
const ROLE_TRANSITION_PERMISSIONS: Record<OrderStatus, string[]> = {
  CONFIRMED: ['ADMIN', 'RESTAURANT_ADMIN', 'KITCHEN', 'KITCHEN_STAFF'],
  PREPARING: ['KITCHEN', 'KITCHEN_STAFF', 'ADMIN', 'RESTAURANT_ADMIN'],
  READY: ['KITCHEN', 'KITCHEN_STAFF', 'ADMIN', 'RESTAURANT_ADMIN'],
  PICKED_UP: ['DELIVERY', 'DELIVERY_PERSONNEL', 'ADMIN', 'RESTAURANT_ADMIN'],
  OUT_FOR_DELIVERY: ['DELIVERY', 'DELIVERY_PERSONNEL', 'ADMIN', 'RESTAURANT_ADMIN'],
  DELIVERED: ['DELIVERY', 'DELIVERY_PERSONNEL', 'ADMIN', 'RESTAURANT_ADMIN'],
  CANCELLED: ['CUSTOMER', 'ADMIN', 'RESTAURANT_ADMIN'],
  PLACED: [],
};

// @desc    Create & checkout order (Server-side price verification)
// @route   POST /api/orders
// @access  Private (CUSTOMER)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { deliveryAddress, paymentMethod, notes } = req.body;

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zipCode) {
      res.status(400).json({ message: 'Complete delivery address (street, city, zipCode) is required' });
      return;
    }

    // Fetch user's active cart
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: 'Your cart is empty. Add items before checking out.' });
      return;
    }

    // 100% Server-side Price & Item Validation from MongoDB MenuItem collection
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of cart.items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        res.status(400).json({ message: `Menu item no longer exists: ${item.menuItem}` });
        return;
      }
      if (!menuItem.isAvailable) {
        res.status(400).json({ message: `Item "${menuItem.name}" is currently out of stock.` });
        return;
      }

      const itemTotal = Number((menuItem.price * item.quantity).toFixed(2));
      calculatedSubtotal += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        itemTotal,
      });
    }

    calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));
    const taxAmount = Number((calculatedSubtotal * 0.05).toFixed(2)); // 5% GST/Tax
    const deliveryFee = calculatedSubtotal > 50 ? 0 : 3.99; // Free delivery over $50
    const totalAmount = Number((calculatedSubtotal + taxAmount + deliveryFee).toFixed(2));

    const restaurant = await Restaurant.findOne();

    // Create central Order document in MongoDB
    const orderNumber = generateOrderNumber();
    const order = new Order({
      orderNumber,
      customer: req.user._id,
      restaurant: restaurant ? restaurant._id : undefined,
      items: orderItems,
      subtotal: calculatedSubtotal,
      taxAmount,
      deliveryFee,
      totalAmount,
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        zipCode: deliveryAddress.zipCode,
        instructions: notes || deliveryAddress.instructions || '',
      },
      status: 'PLACED',
      statusHistory: [
        {
          status: 'PLACED',
          updatedBy: req.user._id,
          timestamp: new Date(),
          note: 'Order placed by customer and payment authorized.',
        },
      ],
      paymentStatus: 'PAID',
    });

    // Create Payment record
    const payment = await Payment.create({
      order: order._id,
      amount: totalAmount,
      method: paymentMethod || 'SIMULATED',
      status: 'COMPLETED',
      transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paidAt: new Date(),
    });

    order.payment = payment._id;
    await order.save();

    // Clear customer's cart after successful order creation
    cart.items = [];
    cart.cartTotal = 0;
    await cart.save();

    // Populate references for socket payload & response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('payment');

    // Broadcast real-time Socket event to Kitchen & Admin dashboards
    notifyOrderCreated(populatedOrder);

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing order checkout' });
  }
};

// @desc    Get customer's own order history
// @route   GET /api/orders/my-orders
// @access  Private (CUSTOMER)
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const orders = await Order.find({ customer: req.user._id })
      .populate('payment')
      .populate('deliveryPersonnel', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching customer orders' });
  }
};

// @desc    Get all orders (Admin / Kitchen / Delivery filterable by status)
// @route   GET /api/orders
// @access  Private (ADMIN, KITCHEN, DELIVERY)
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, limit } = req.query;

    const filter: any = {};
    if (status) {
      if (typeof status === 'string' && status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    // Delivery drivers see READY or assigned orders if filtering
    if (req.user?.role === 'DELIVERY') {
      if (!status) {
        filter.$or = [
          { status: 'READY' },
          { deliveryPersonnel: req.user._id },
        ];
      }
    }

    const query = Order.find(filter)
      .populate('customer', 'name email phone address')
      .populate('payment')
      .populate('deliveryPersonnel', 'name phone')
      .populate('delivery')
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(Number(limit));
    }

    const orders = await query.exec();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching orders' });
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private (All authenticated roles)
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('payment')
      .populate('deliveryPersonnel', 'name phone')
      .populate('delivery')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Role check: CUSTOMER can only view their own order
    if (req.user?.role === 'CUSTOMER' && order.customer._id.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching order details' });
  }
};

// @desc    Update order status (State Transition Logic)
// @route   PATCH /api/orders/:id/status
// @access  Private (ADMIN, KITCHEN, DELIVERY)
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { status: targetStatus, note } = req.body as { status: OrderStatus; note?: string };

    if (!targetStatus) {
      res.status(400).json({ message: 'Target status is required' });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const currentStatus = order.status;

    // Validate lifecycle transition path
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(targetStatus)) {
      res.status(400).json({
        message: `Invalid status transition from "${currentStatus}" to "${targetStatus}". Allowed next statuses: [${allowedNextStatuses.join(', ')}]`,
      });
      return;
    }

    // Validate role permissions for this transition
    const requiredRoles = ROLE_TRANSITION_PERMISSIONS[targetStatus] || [];
    if (!requiredRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Role "${req.user.role}" is not authorized to transition order to "${targetStatus}". Required roles: [${requiredRoles.join(', ')}]`,
      });
      return;
    }

    // Special logic when transitioning to PICKED_UP
    if (targetStatus === 'PICKED_UP') {
      if (req.user.role === 'DELIVERY' || req.user.role === 'DELIVERY_PERSONNEL') {
        order.deliveryPersonnel = req.user._id;
      }
      
      let delivery = await Delivery.findOne({ order: order._id });
      if (!delivery) {
        delivery = new Delivery({
          order: order._id,
          deliveryPersonnel: order.deliveryPersonnel || req.user._id,
          status: 'PICKED_UP',
          deliveryAddress: order.deliveryAddress,
          assignedAt: new Date(),
          pickedUpAt: new Date(),
        });
      } else {
        delivery.status = 'PICKED_UP';
        delivery.pickedUpAt = new Date();
        if (!delivery.deliveryPersonnel) {
          delivery.deliveryPersonnel = req.user._id;
        }
      }
      await delivery.save();
    }

    // Special logic when transitioning to OUT_FOR_DELIVERY
    if (targetStatus === 'OUT_FOR_DELIVERY') {
      if (req.user.role === 'DELIVERY' || req.user.role === 'DELIVERY_PERSONNEL') {
        order.deliveryPersonnel = req.user._id;
      }
      
      // Update or create Delivery collection document
      let delivery = await Delivery.findOne({ order: order._id });
      if (!delivery) {
        delivery = new Delivery({
          order: order._id,
          deliveryPersonnel: order.deliveryPersonnel || req.user._id,
          status: 'IN_TRANSIT',
          deliveryAddress: order.deliveryAddress,
          assignedAt: new Date(),
          pickedUpAt: new Date(),
        });
      } else {
        delivery.status = 'IN_TRANSIT';
        if (!delivery.pickedUpAt) delivery.pickedUpAt = new Date();
        if (!delivery.deliveryPersonnel) {
          delivery.deliveryPersonnel = req.user._id;
        }
      }
      await delivery.save();
    }

    // Special logic when transitioning to DELIVERED
    if (targetStatus === 'DELIVERED') {
      const delivery = await Delivery.findOne({ order: order._id });
      if (delivery) {
        delivery.status = 'DELIVERED';
        delivery.deliveredAt = new Date();
        await delivery.save();
      }
    }

    // Mutate central MongoDB order document
    order.status = targetStatus;
    order.statusHistory.push({
      status: targetStatus,
      updatedBy: req.user._id,
      timestamp: new Date(),
      note: note || `Status updated to ${targetStatus} by ${req.user.name} (${req.user.role})`,
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('payment')
      .populate('deliveryPersonnel', 'name phone');

    // Broadcast real-time Socket event to ALL connected clients tracking this order & dashboards
    notifyOrderStatusUpdated(updatedOrder, currentStatus);

    res.json({
      message: `Order status updated to ${targetStatus}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
};

// @desc    Cancel order (Customer if PLACED, Admin anytime before DELIVERED)
// @route   POST /api/orders/:id/cancel
// @access  Private (CUSTOMER, ADMIN)
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      res.status(400).json({ message: `Cannot cancel order in state "${order.status}"` });
      return;
    }

    // Customer can only cancel if status is still PLACED
    if (req.user.role === 'CUSTOMER') {
      if (order.customer.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'Not authorized to cancel this order' });
        return;
      }
      if (order.status !== 'PLACED') {
        res.status(400).json({ message: 'Order can only be cancelled while in PLACED status. Contact restaurant support.' });
        return;
      }
    }

    const previousStatus = order.status;
    order.status = 'CANCELLED';
    order.statusHistory.push({
      status: 'CANCELLED',
      updatedBy: req.user._id,
      timestamp: new Date(),
      note: reason || `Cancelled by ${req.user.name} (${req.user.role})`,
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('payment');

    notifyOrderStatusUpdated(updatedOrder, previousStatus);

    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error cancelling order' });
  }
};
