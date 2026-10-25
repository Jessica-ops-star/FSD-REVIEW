import { Response } from 'express';
import Cart from '../models/Cart';
import MenuItem from '../models/MenuItem';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to recalculate total
const recalculateCart = (cart: any) => {
  cart.cartTotal = cart.items.reduce((sum: number, item: any) => sum + item.itemTotal, 0);
  cart.cartTotal = Number(cart.cartTotal.toFixed(2));
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (CUSTOMER)
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    let cart = await Cart.findOne({ customer: req.user._id }).populate('items.menuItem');
    
    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [], cartTotal: 0 });
    }

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching cart' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private (CUSTOMER)
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { menuItemId, quantity } = req.body;

    if (!menuItemId) {
      res.status(400).json({ message: 'menuItemId is required' });
      return;
    }

    const qty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      res.status(400).json({ message: 'Menu item is unavailable or not found' });
      return;
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [], cartTotal: 0 });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId.toString()
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
      cart.items[existingIndex].itemTotal = Number((cart.items[existingIndex].quantity * menuItem.price).toFixed(2));
    } else {
      cart.items.push({
        menuItem: menuItem._id,
        quantity: qty,
        priceAtAdd: menuItem.price,
        itemTotal: Number((qty * menuItem.price).toFixed(2)),
      });
    }

    recalculateCart(cart);
    await cart.save();

    const populated = await cart.populate('items.menuItem');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding item to cart' });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:itemId
// @access  Private (CUSTOMER)
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { itemId } = req.params; // menuItem ID or cart item sub-document ID
    const { quantity } = req.body;

    const newQty = Number(quantity);

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.menuItem.toString() === itemId || i._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }

    if (newQty <= 0) {
      // Remove item if quantity set to 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].itemTotal = Number((newQty * cart.items[itemIndex].priceAtAdd).toFixed(2));
    }

    recalculateCart(cart);
    await cart.save();

    const populated = await cart.populate('items.menuItem');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating cart item' });
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private (CUSTOMER)
export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter(
      (i) => i.menuItem.toString() !== itemId && i._id?.toString() !== itemId
    );

    recalculateCart(cart);
    await cart.save();

    const populated = await cart.populate('items.menuItem');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error removing cart item' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (CUSTOMER)
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const cart = await Cart.findOne({ customer: req.user._id });
    if (cart) {
      cart.items = [];
      cart.cartTotal = 0;
      await cart.save();
    }

    res.json({ message: 'Cart cleared successfully', items: [], cartTotal: 0 });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error clearing cart' });
  }
};
