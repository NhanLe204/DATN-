import mongoose from 'mongoose';
import rateModel from '../models/rate.model.js';
import { Request, Response } from 'express';
import orderModel from '../models/order.model.js';

export const createOrderAfterPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderDetailID, score } = req.body;
    console.log(orderDetailID, score);
    const newRating = await rateModel.create({ orderDetailID, score });
    res.status(201).json(newRating);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to create rating', details: errorMessage });
  }
};
