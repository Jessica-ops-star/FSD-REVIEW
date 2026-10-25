import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { ADMIN_SETUP_KEY, KITCHEN_INVITE_CODE, DELIVERY_INVITE_CODE } from './authController';

// @desc    Get all staff members (Admin, Kitchen, Delivery)
// @route   GET /api/staff
// @access  Private (ADMIN)
export const getStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await User.find({
      role: { $in: ['ADMIN', 'RESTAURANT_ADMIN', 'KITCHEN', 'KITCHEN_STAFF', 'DELIVERY', 'DELIVERY_PERSONNEL'] },
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching staff members' });
  }
};

// @desc    Admin directly creates a staff account (Kitchen or Delivery)
// @route   POST /api/staff
// @access  Private (ADMIN)
export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      res.status(400).json({ message: 'All fields are required (name, email, password, phone, role)' });
      return;
    }

    const normalizedRole = role.toUpperCase();
    if (!['KITCHEN', 'KITCHEN_STAFF', 'DELIVERY', 'DELIVERY_PERSONNEL', 'ADMIN', 'RESTAURANT_ADMIN'].includes(normalizedRole)) {
      res.status(400).json({ message: 'Invalid staff role specified' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }

    const standardRole = normalizedRole === 'KITCHEN_STAFF' ? 'KITCHEN' : normalizedRole === 'DELIVERY_PERSONNEL' ? 'DELIVERY' : normalizedRole;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: standardRole,
      isActive: true,
    });

    res.status(201).json({
      message: `${standardRole} staff account created successfully`,
      staff: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating staff account' });
  }
};

// @desc    Toggle staff active / inactive status
// @route   PATCH /api/staff/:id/status
// @access  Private (ADMIN)
export const toggleStaffStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    // Prevent deactivating own admin account
    if (req.user && req.user._id.toString() === user._id.toString()) {
      res.status(400).json({ message: 'You cannot deactivate your own active admin account' });
      return;
    }

    user.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !user.isActive;
    await user.save();

    res.json({
      message: `Staff member ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      staff: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating staff status' });
  }
};

// @desc    Reset staff member password
// @route   POST /api/staff/:id/reset-password
// @access  Private (ADMIN)
export const resetStaffPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: `Password reset successfully for ${user.name}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error resetting staff password' });
  }
};

// @desc    Get system authorization invitation codes
// @route   GET /api/staff/invitations
// @access  Private (ADMIN)
export const getStaffInvitations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      adminSetupKey: ADMIN_SETUP_KEY,
      kitchenInviteCode: KITCHEN_INVITE_CODE,
      deliveryInviteCode: DELIVERY_INVITE_CODE,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching invitations' });
  }
};
