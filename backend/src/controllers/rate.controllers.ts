import mongoose from 'mongoose';
import rateModel from '../models/rating.model.js';
import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
import { get } from 'http';
export interface CustomRequest extends Request {
  user?: IUser;
}

export const createRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, orderDetailId, content, userId, score } = req.body;
    console.log(productId, orderDetailId, content, userId, score);
    if (!productId || !content || !score || !userId || !orderDetailId) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
      return;
    }
    const newRate = new rateModel({
      productId,
      userId,
      orderDetailId,
      content,
      score
    });
    const savedRate = await newRate.save();
    res.status(201).json({
      success: true,
      message: 'Tạo đánh giá thành công',
      data: savedRate
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to create rating', details: errorMessage });
  }
};
export const getRatingByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
      return;
    }
    const ratings = await rateModel.find({ productId: id }).populate({ path: 'userId', select: '-password' });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: ratings
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to get rating', details: errorMessage });
  }
};
