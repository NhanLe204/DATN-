import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
import mongoose from 'mongoose';
import blogCategoryModel from '../models/blogCategory.model.js';
import { BlogCategoryStatus } from '../enums/blogCategory.enum.js';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const getAllBlogCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await blogCategoryModel.find();
    res.status(200).json({ success: true, result });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error category up: ${error.message}`);
    } else {
      console.error('Error category up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const insertBlogCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Please provide an name and description product'
      });
      return;
    }
    const existingNameBlogCategory = await blogCategoryModel.findOne({ name });
    if (existingNameBlogCategory) {
      res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
      return;
    }
    const newBlogCategory = new blogCategoryModel({
      name,
      description
    });
    await newBlogCategory.save();
    res.status(201).json({
      success: true,
      user: { ...newBlogCategory._doc }
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error category up: ${error.message}`);
    } else {
      console.error('Error category up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getBlogCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await blogCategoryModel.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Không tìm thấy danh mục bài viết' });
      return;
    }
    res.status(200).json({ message: 'Lấy danh mục bài viết thành công', category });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error category up: ${error.message}`);
      return;
    } else {
      console.error('Error category up:', error);
      return;
    }
  }
};

export const updateBlogCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(id, 'ID');

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
      return;
    }

    const { name, description, status } = req.body;

    if (!name || status === undefined) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên, mô tả và trạng thái danh mục bài viết'
      });
      return;
    }

    if (!Object.values(BlogCategoryStatus).includes(status as BlogCategoryStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái danh mục bài viết không hợp lệ' });
      return;
    }

    // Tìm và cập nhật danh mục bài viết
    const updatedBlogCategory = await blogCategoryModel.findByIdAndUpdate(
      id,
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!updatedBlogCategory) {
      res.status(404).json({ success: false, message: 'Danh mục bài viết không tồn tại' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Danh mục bài viết được cập nhật thành công',
      blogCategory: updatedBlogCategory
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi cập nhật danh mục bài viết: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    } else {
      console.error('Lỗi không xác định khi cập nhật danh mục bài viết:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
};

export const getBlogCategoriesActive = async (req: Request, res: Response) => {
  try {
    const result = await blogCategoryModel.find({ status: BlogCategoryStatus.ACTIVE });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Xóa category
export const deleteBlogCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const blogCategory = await blogCategoryModel.findById(id);
    if (!blogCategory) {
      res.status(404).json({ message: 'Không tìm thấy danh mục bài viết' });
      return;
    }

    await blogCategoryModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xóa danh mục bài viết thành công' });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error category up: ${error.message}`);
      return;
    } else {
      console.error('Error category up:', error);
      return;
    }
  }
};

export const toggleBlogCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    console.log('ID Category:', id);
    console.log('Status Category:', status);

    if (!id) {
      res.status(400).json({ message: 'Vui lòng cung cấp ID danh mục bài viết' });
      return;
    }

    // Kiểm tra status có hợp lệ không
    const statusString = String(status).toLowerCase();
    if (!Object.values(BlogCategoryStatus).includes(statusString as BlogCategoryStatus)) {
      res.status(400).json({
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "active" hoặc "inactive"'
      });
      return;
    }

    // Tìm danh mục bài viết theo ID
    const blogCategory = await blogCategoryModel.findById(id);
    if (!blogCategory) {
      res.status(404).json({ message: 'Danh mục bài viết không tồn tại' });
      return;
    }

    // Chuyển đổi status sang boolean (inactive = true, active = false)
    const isHidden = statusString === BlogCategoryStatus.INACTIVE;

    // Cập nhật trạng thái `isHidden`
    blogCategory.status = isHidden ? 'inactive' : 'active';
    await blogCategory.save();

    res.status(200).json({
      message: isHidden ? 'Danh mục bài viết đã được ẩn thành công' : 'Danh mục bài viết đã mở lại thành công',
      blogCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái danh mục bài viết', error });
    return;
  }
};
