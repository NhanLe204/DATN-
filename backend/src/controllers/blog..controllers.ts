import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Blog from '../models/blog.model.js';
import { IUser } from '../interfaces/user.interface.js';
import { IBlog } from '../interfaces/blog.interface.js';
import { BlogStatus } from '../enums/blog.enum.js';

// Interface cho request đã xác thực
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Middleware validate
export const validateBlog = (req: Request, res: Response, next: Function) => {
  const { title, content, product, image_url } = req.body;

  if (!title || !content || !product) {
    return res.status(400).json({
      success: false,
      message: 'Title, content, and product are required',
    });
  }
  if (!mongoose.Types.ObjectId.isValid(product)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID',
    });
  }
  if (image_url && !Array.isArray(image_url)) {
    return res.status(400).json({
      success: false,
      message: 'image_url must be an array of strings',
    });
  }
  next();
};

// GET: Lấy danh sách blog
export const getAllBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find()
      .populate('product', 'name')
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    console.log('Blogs found:', blogs); // Kiểm tra dữ liệu trả về từ DB
    
    res.status(200).json({
      success: true,
      data: blogs,
      message: 'Blogs retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blogs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};