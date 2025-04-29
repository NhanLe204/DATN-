import { Request, Response } from 'express';
import blogModel from '../models/blog.model.js';
import { BlogStatus } from '../enums/blog.enum.js';

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    let image_url = '';
    if (req.file) {
      image_url = req.file.path; // URL từ Cloudinary
      console.log('Image uploaded to Cloudinary:', image_url);
    } else {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { title, content, blog_category_id, author, product, user, status } = req.body;

    if (!title || !content || !blog_category_id || !author) {
      res.status(400).json({ success: false, message: 'Missing required fields: title, content, author' });
      return;
    }

    const newBlog = new blogModel({
      title,
      content,
      image_url,
      blog_category_id,
      author,
      product,
      user,
      status: status || BlogStatus.ACTIVE
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ success: true, message: 'Blog created successfully', data: savedBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when creating blog',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await blogModel.find().populate('blog_category_id', 'name');
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error when fetching blogs' });
  }
};

export const getActiveBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const blogs = await blogModel
      .find({ status: BlogStatus.ACTIVE })
      .skip(skip)
      .limit(limit)
      .populate('blog_category_id', 'name');
    const total = await blogModel.countDocuments({ status: BlogStatus.ACTIVE });

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error when fetching active blogs' });
  }
};

// Get a blog by ID
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);

    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error when fetching blog' });
  }
};

// Update a blog
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, blog_category_id, author, product, user, status } = req.body;

    // Tìm blog hiện tại
    const blog = await blogModel.findById(id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    // Giữ ảnh cũ nếu không upload ảnh mới
    let image_url = blog.image_url;
    if (req.file) {
      image_url = req.file.path; // Cập nhật URL mới từ Cloudinary
    }

    // Cập nhật blog
    const updatedBlog = await blogModel.findByIdAndUpdate(
      id,
      {
        title,
        content,
        image_url,
        blog_category_id,
        author,
        product,
        user,
        status: status || BlogStatus.ACTIVE
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Blog updated successfully', data: updatedBlog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when updating blog',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a blog
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);

    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    await blogModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error when deleting blog' });
  }
};
