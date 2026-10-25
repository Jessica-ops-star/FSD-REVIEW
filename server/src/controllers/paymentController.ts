import { Request, Response } from 'express';
import Payment from '../models/Payment';

export const getPaymentByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId });
    if (!payment) {
      res.status(404).json({ message: 'Payment record not found' });
      return;
    }
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching payment record' });
  }
};
