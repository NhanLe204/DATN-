import mongoose from 'mongoose';
import rateModel from '../models/rate.model.js';
import { Request, Response } from 'express';
export const getAllRatings = async (req: Request, res: Response) => {
  try {
    const ratings = await rateModel.find().populate('orderDetailID');
    res.status(200).json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách rating', error });
  }
};
export const getRatingID = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const rate = await rateModel.findById(id);
    if (!rate) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
      return;
    }
    res.status(200).json({ success: true, data: rate });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching rate: ${error.message}`);
    } else {
      console.error('Error fetching rate:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
