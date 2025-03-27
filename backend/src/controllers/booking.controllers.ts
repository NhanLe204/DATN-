import { Request, Response } from 'express';
import { CategoryStatus } from '../enums/category.enum.js';
import mongoose from 'mongoose';
import bookingModel from '../models/booking.model.js';
import { create } from 'domain';

export const createBookingSpa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, serviceId, booking_date, booking_time } = req.body;
    const bookingExist = await bookingModel.findOne({ userId, serviceId, booking_date, booking_time });
    if (bookingExist) {
      res.status(400).json({ message: 'Quý khách đã đặt lịch hẹn này rồi' });
      return;
    }

    const booking = await bookingModel.create(req.body);
    res.status(201).json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
