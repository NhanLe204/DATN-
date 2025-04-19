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
    const orderDetail = await orderDetailModel.findById(orderDetailId);
    if (!orderDetail) {
      res.status(404).json({ success: false, message: 'Chi tiết đơn hàng không tồn tại' });
      return;
    }

    // Kiểm tra xem orderDetail đã được đánh giá chưa
    if (orderDetail.isRated) {
      res.status(400).json({ success: false, message: 'Sản phẩm này đã được đánh giá' });
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

    // Cập nhật isRated trong orderDetail
    await orderDetailModel.updateOne({ _id: orderDetailId }, { $set: { isRated: true } });

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
    const { id: productId } = req.params; // Lấy productId từ URL params

    // Kiểm tra tính hợp lệ của productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: 'Invalid productId' });
      return;
    }

    // Parse productId thành ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Tìm tất cả các orderDetail có productId này
    const orderDetails = await orderDetailModel.find({ productId: productObjectId }).select('_id');

    if (!orderDetails || orderDetails.length === 0) {
      res.status(404).json({ success: false, message: 'No order details found for this product' });
      return;
    }

    // Lấy danh sách _id của orderDetail
    const orderDetailIds = orderDetails.map((detail) => detail._id);

    // Tìm tất cả các đánh giá có _id trùng với orderDetailIds
    const ratings = await rateModel.find({ _id: { $in: orderDetailIds } }).populate('userId', 'fullname avatar');

    if (!ratings || ratings.length === 0) {
      res.status(404).json({ success: false, message: 'No ratings found for this product' });
      return;
    }

    // Chuẩn bị dữ liệu trả về
    const ratingData = ratings.map((rating) => ({
      userId: rating.userId._id,
      userName: rating.userId.fullname,
      userAvatar: rating.userId.avatar,
      content: rating.content,
      score: rating.score,
      likes: rating.likes,
      createdAt: rating.createdAt
    }));

    res.json({ success: true, data: ratingData });
  } catch (error) {
    console.error('Error fetching product ratings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: `Server error: ${errorMessage}` });
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
