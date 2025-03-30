import { Router } from 'express';
import { getAllBlogs, createBlog, getBlogById, updateBlog, deleteBlog } from '../controllers/blog.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireAdmin } from '../middlewares/protectRoute.js';
const blogRouter = Router();
// Lấy tất cả bài viết
blogRouter.get('/blogs', getAllBlogs);
// Lấy bài viết theo ID
blogRouter.get('/blogs/:id', getBlogById);
// Tạo bài viết mới (yêu cầu xác thực và quyền admin)
blogRouter.post('/blogs', verifyToken, requireAdmin, createBlog);
// Cập nhật bài viết theo ID (yêu cầu xác thực và quyền admin)
blogRouter.patch('/blogs/:id', verifyToken, requireAdmin, updateBlog);
// Xóa bài viết theo ID (yêu cầu xác thực và quyền admin)
blogRouter.delete('/blogs/:id', verifyToken, requireAdmin, deleteBlog);
export default blogRouter;
//# sourceMappingURL=service.routes.js.map