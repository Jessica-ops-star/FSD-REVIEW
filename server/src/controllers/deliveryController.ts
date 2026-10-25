import { Response } from 'express';
import Delivery from '../models/Delivery';
import Order from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { notifyDeliveryAssigned, notifyOrderStatusUpdated } from '../socket/socketManager';

// @desc    Get all available delivery personnel
// @route   GET /api/deliveries/available-personnel
// @access  Private (ADMIN)
export const getAvailablePersonnel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const personnel = await User.find({ 
      role: { $in: ['DELIVERY', 'DELIVERY_PERSONNEL'] }, 
      isActive: true 
    }).select('name email phone address');
    res.json(personnel);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching delivery personnel' });
  }
};

// @desc    Admin manually allocates / approves delivery staff to an order
// @route   POST /api/deliveries/assign
// @access  Private (ADMIN)
export const assignDeliveryPersonnel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, deliveryPersonnelId } = req.body;

    if (!orderId || !deliveryPersonnelId) {
      res.status(400).json({ message: 'Both orderId and deliveryPersonnelId are required' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const driver = await User.findOne({ 
      _id: deliveryPersonnelId, 
      role: { $in: ['DELIVERY', 'DELIVERY_PERSONNEL'] },
      isActive: true,
    });
    if (!driver) {
      res.status(400).json({ message: 'Selected active delivery personnel user not found' });
      return;
    }

    // Allocate rider to order and set status to ALLOCATED / PENDING acceptance
    order.deliveryPersonnel = driver._id;
    order.deliveryStatus = 'ALLOCATED';
    order.deliveryAcceptance = 'PENDING';

    let delivery = await Delivery.findOne({ order: order._id });
    if (!delivery) {
      delivery = await Delivery.create({
        order: order._id,
        deliveryPersonnel: driver._id,
        status: 'ALLOCATED',
        isAccepted: false,
        allocatedBy: req.user?._id,
        isApproved: true,
        approvedBy: req.user?._id,
        deliveryAddress: order.deliveryAddress,
        assignedAt: new Date(),
      });
    } else {
      delivery.deliveryPersonnel = driver._id;
      delivery.status = 'ALLOCATED';
      delivery.isAccepted = false;
      delivery.allocatedBy = req.user?._id;
      delivery.isApproved = true;
      delivery.approvedBy = req.user?._id;
      delivery.assignedAt = new Date();
      await delivery.save();
    }

    order.delivery = delivery._id;
    order.statusHistory.push({
      status: order.status,
      updatedBy: req.user?._id,
      timestamp: new Date(),
      note: `Delivery allocated to rider ${driver.name} by Admin ${req.user?.name || ''}`,
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('payment')
      .populate('deliveryPersonnel', 'name email phone')
      .populate('delivery');

    // Real-time Socket broadcast: notify the rider directly and broadcast updates
    notifyDeliveryAssigned(driver._id.toString(), updatedOrder);
    notifyOrderStatusUpdated(updatedOrder, order.status);

    res.json({
      message: `Delivery successfully allocated to ${driver.name}. Awaiting rider acceptance.`,
      delivery,
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error assigning delivery personnel' });
  }
};

// @desc    Delivery rider accepts an allocated delivery order
// @route   POST /api/deliveries/:id/accept
// @access  Private (DELIVERY, ADMIN)
export const acceptDeliveryOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const driverId = order.deliveryPersonnel ? order.deliveryPersonnel.toString() : '';
    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'RESTAURANT_ADMIN';

    // Verify order is allocated to this delivery rider (or admin approving on rider behalf)
    if (!isAdmin && driverId !== userId) {
      const deliveryObj = await Delivery.findOne({ order: order._id });
      const deliveryDriverId = deliveryObj?.deliveryPersonnel?.toString();
      if (deliveryDriverId !== userId) {
        res.status(403).json({
          message: 'This delivery order is not allocated to you. Please wait for Admin allocation.',
        });
        return;
      }
    }

    order.deliveryStatus = 'ACCEPTED';
    order.deliveryAcceptance = 'ACCEPTED';
    order.statusHistory.push({
      status: order.status,
      updatedBy: req.user._id,
      timestamp: new Date(),
      note: `Delivery order accepted by ${req.user.name}`,
    });

    let delivery = await Delivery.findOne({ order: order._id });
    if (!delivery) {
      delivery = await Delivery.create({
        order: order._id,
        deliveryPersonnel: order.deliveryPersonnel || req.user._id,
        status: 'ACCEPTED',
        isAccepted: true,
        acceptedAt: new Date(),
        deliveryAddress: order.deliveryAddress,
        assignedAt: new Date(),
      });
    } else {
      delivery.status = 'ACCEPTED';
      delivery.isAccepted = true;
      delivery.acceptedAt = new Date();
      await delivery.save();
    }

    order.delivery = delivery._id;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('payment')
      .populate('deliveryPersonnel', 'name email phone')
      .populate('delivery');

    // Socket notifications
    notifyOrderStatusUpdated(updatedOrder, order.status);
    if (order.deliveryPersonnel) {
      notifyDeliveryAssigned(order.deliveryPersonnel.toString(), updatedOrder);
    }

    res.json({
      message: 'Delivery order accepted successfully! You can now proceed to pick up the food from the kitchen.',
      order: updatedOrder,
      delivery,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error accepting delivery order' });
  }
};

// @desc    Get assigned deliveries for logged-in delivery driver or Admin
// @route   GET /api/deliveries/my-assignments
// @access  Private (DELIVERY, ADMIN)
export const getMyAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'RESTAURANT_ADMIN';
    const query = isAdmin
      ? {} // Admin sees all orders across the system
      : {
          $or: [
            { deliveryPersonnel: req.user._id },
            { status: { $in: ['READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } },
          ],
        };

    const orders = await Order.find(query)
      .populate('customer', 'name email phone address')
      .populate('payment')
      .populate('deliveryPersonnel', 'name email phone')
      .populate('delivery')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching delivery assignments' });
  }
};

// @desc    Update delivery status (Accept / Pick Up / Out for Delivery / Delivered)
// @route   PATCH /api/deliveries/:id/status
// @access  Private (DELIVERY)
export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { status: targetDeliveryStatus, notes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Handle acceptance
    if (targetDeliveryStatus === 'ACCEPTED') {
      return acceptDeliveryOrder(req, res);
    }

    let targetOrderStatus: string = order.status;

    if (targetDeliveryStatus === 'PICKED_UP') {
      targetOrderStatus = 'PICKED_UP';
    } else if (targetDeliveryStatus === 'IN_TRANSIT' || targetDeliveryStatus === 'OUT_FOR_DELIVERY') {
      targetOrderStatus = 'OUT_FOR_DELIVERY';
    } else if (targetDeliveryStatus === 'DELIVERED') {
      targetOrderStatus = 'DELIVERED';
    }

    const previousStatus = order.status;
    order.status = targetOrderStatus as any;
    order.deliveryPersonnel = req.user._id;
    order.deliveryStatus = (targetDeliveryStatus === 'IN_TRANSIT' ? 'OUT_FOR_DELIVERY' : targetDeliveryStatus) as any;
    order.deliveryAcceptance = 'ACCEPTED';

    order.statusHistory.push({
      status: targetOrderStatus as any,
      updatedBy: req.user._id,
      timestamp: new Date(),
      note: notes || `Delivery status changed to ${targetDeliveryStatus} by rider ${req.user.name}`,
    });

    let delivery = await Delivery.findOne({ order: order._id });
    if (!delivery) {
      delivery = new Delivery({
        order: order._id,
        deliveryPersonnel: req.user._id,
        status: targetDeliveryStatus,
        isAccepted: true,
        deliveryAddress: order.deliveryAddress,
        assignedAt: new Date(),
      });
    } else {
      delivery.status = targetDeliveryStatus;
      delivery.isAccepted = true;
    }

    if (targetDeliveryStatus === 'PICKED_UP') {
      delivery.pickedUpAt = new Date();
    } else if (targetDeliveryStatus === 'IN_TRANSIT' || targetDeliveryStatus === 'OUT_FOR_DELIVERY') {
      if (!delivery.pickedUpAt) delivery.pickedUpAt = new Date();
    } else if (targetDeliveryStatus === 'DELIVERED') {
      delivery.deliveredAt = new Date();
    }

    if (notes) delivery.notes = notes;
    await delivery.save();

    order.delivery = delivery._id;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone address')
      .populate('payment')
      .populate('deliveryPersonnel', 'name email phone')
      .populate('delivery');

    notifyOrderStatusUpdated(updatedOrder, previousStatus);

    res.json({
      message: `Delivery updated to ${targetDeliveryStatus}`,
      order: updatedOrder,
      delivery,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating delivery status' });
  }
};
