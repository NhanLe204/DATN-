import { Router } from 'express';
import {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  getActiveBlogs
} from '../controllers/blog.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireAdmin } from '../middlewares/protectRoute.js';
import uploader from '../config/cloudinary.config.js';

const blogRouter = Router();

// Lấy tất cả bài viết
blogRouter.get('/blogs', getAllBlogs);

blogRouter.get('/blogs/status/active', getActiveBlogs);

// Lấy bài viết theo ID
blogRouter.get('/blogs/:id', getBlogById);

// Tạo bài viết mới (yêu cầu xác thực và quyền admin)
blogRouter.post('/blogs', verifyToken, requireAdmin, uploader.single('image_url'), createBlog);

// Cập nhật bài viết theo ID (yêu cầu xác thực và quyền admin)
blogRouter.patch('/blogs/:id', verifyToken, requireAdmin, uploader.single('image_url'), updateBlog);

// Xóa bài viết theo ID (yêu cầu xác thực và quyền admin)
blogRouter.delete('/blogs/:id', verifyToken, requireAdmin, deleteBlog);

export default blogRouter;
