import { Request, Response } from 'express';
import User from '../models/User';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' }).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching customers' });
  }
};
