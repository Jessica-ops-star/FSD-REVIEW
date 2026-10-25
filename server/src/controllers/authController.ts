import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

export const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'ADMIN2026';
export const KITCHEN_INVITE_CODE = process.env.KITCHEN_INVITE_CODE || 'KITCHEN2026';
export const DELIVERY_INVITE_CODE = process.env.DELIVERY_INVITE_CODE || 'DELIVERY2026';

// @desc    Register a new user (Role-authorized registration)
// @route   POST /api/auth/register
// @access  Public for Customer; Protected by setup key / invitation code for privileged roles
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address, role, setupKey, invitationCode } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ message: 'Please provide all required fields (name, email, password, phone)' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }

    // Role-specific verification to prevent unauthorized privilege escalation
    let assignedRole: 'CUSTOMER' | 'ADMIN' | 'KITCHEN' | 'DELIVERY' = 'CUSTOMER';
    const rawRole = (role || 'CUSTOMER').toString().toUpperCase();

    if (rawRole === 'ADMIN' || rawRole === 'RESTAURANT_ADMIN') {
      const adminCount = await User.countDocuments({ role: { $in: ['ADMIN', 'RESTAURANT_ADMIN'] } });
      const isValidKey = setupKey === ADMIN_SETUP_KEY || invitationCode === ADMIN_SETUP_KEY;
      
      // Allow if setup key matches or if initial admin setup when 0 admins exist
      if (!isValidKey && adminCount > 0) {
        res.status(403).json({
          message: 'Unauthorized: A valid Administrator Setup Passcode is required to create a Restaurant Admin account.',
        });
        return;
      }
      assignedRole = 'ADMIN';
    } else if (rawRole === 'KITCHEN' || rawRole === 'KITCHEN_STAFF') {
      const isValidCode = invitationCode === KITCHEN_INVITE_CODE || setupKey === KITCHEN_INVITE_CODE;
      if (!isValidCode) {
        res.status(403).json({
          message: 'Unauthorized: A valid Kitchen Staff Invitation Code is required to create a Kitchen account.',
        });
        return;
      }
      assignedRole = 'KITCHEN';
    } else if (rawRole === 'DELIVERY' || rawRole === 'DELIVERY_PERSONNEL') {
      const isValidCode = invitationCode === DELIVERY_INVITE_CODE || setupKey === DELIVERY_INVITE_CODE;
      if (!isValidCode) {
        res.status(403).json({
          message: 'Unauthorized: A valid Delivery Personnel Invitation Code is required to create a Delivery account.',
        });
        return;
      }
      assignedRole = 'DELIVERY';
    } else {
      assignedRole = 'CUSTOMER';
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: assignedRole,
      address: address || {},
    });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      message: `${assignedRole} registered successfully`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide both email and password' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        _id: req.user._id,
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        isActive: req.user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error fetching user profile' });
  }
};
