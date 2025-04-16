import mongoose from 'mongoose';
import rateModel from '../models/rating.model.js';
import productModel from '../models/product.model.js';
import orderDetailModel from '../models/orderdetail.model.js';
import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
import { get } from 'http';
export interface CustomRequest extends Request {
  user?: IUser;
}

export const createRating = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { orderDetailId, content, score } = req.body;

    // Lấy userId từ middleware xác thực
    const userId = req.user?._id;

    // Kiểm tra đầu vào
    if (!content || !score || !userId || !orderDetailId) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
      return;
    }

    // Kiểm tra tính hợp lệ của productI

    // Kiểm tra tính hợp lệ của orderDetailId
    const orderDetailExists = await orderDetailModel.findById(orderDetailId);
    if (!orderDetailExists) {
      res.status(404).json({ success: false, message: 'Chi tiết đơn hàng không tồn tại' });
      return;
    }

    // Tạo đánh giá mới
    const newRate = new rateModel({
      _id: orderDetailId,
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

export const getRatingByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
      return;
    }
    const ratings = await rateModel
      .find({ userId: id })
      .populate({ path: 'userId', select: '-password' })
      .populate({ path: '_id' });
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
