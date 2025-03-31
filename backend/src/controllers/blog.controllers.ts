import { Request, Response } from 'express';
import blogModel from '../models/blog.model.js';
import { BlogStatus } from '../enums/blog.enum.js';

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, image_url, author, product, user, status } = req.body;

    if (!title || !content || !author || !product || !user) {
      res
        .status(400)
        .json({ success: false, message: 'Missing required fields: title, content, author, product, user' });
      return;
    }

    const newBlog = new blogModel({
      title,
      content,
      image_url: image_url || [],
      author,
      product,
      user,
      status: status || BlogStatus.ACTIVE
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ success: true, message: 'Blog created successfully', data: savedBlog });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error when creating blog',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await blogModel.find();
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

    const blogs = await blogModel.find({ status: BlogStatus.ACTIVE }).skip(skip).limit(limit);
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
    const { title, content, image_url, author, status } = req.body;

    const blog = await blogModel.findById(id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (image_url) blog.image_url = image_url;
    if (author) blog.author = author;
    if (status && Object.values(BlogStatus).includes(status)) blog.status = status;

    const updatedBlog = await blog.save();
    res.status(200).json({ success: true, message: 'Blog updated successfully', data: updatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error when updating blog' });
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
