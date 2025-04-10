import { Router, Request, Response } from 'express';
import {
  deleteBlogCategory,
  getAllBlogCategory,
  getBlogCategoriesActive,
  getBlogCategoryById,
  insertBlogCategory,
  toggleBlogCategory,
  updateBlogCategory
} from '../controllers/blogCategory.controllers.js';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const blogCategoryRouter = Router();

// http://localhost:5000/api/v1/categories

blogCategoryRouter.get('/blogcategories', getAllBlogCategory);
blogCategoryRouter.get('/blogcategories/:id', getBlogCategoryById);
blogCategoryRouter.get('/blogcategories/status/active', getBlogCategoriesActive);
blogCategoryRouter.post('/blogcategories', verifyToken, requireAdmin, insertBlogCategory);
blogCategoryRouter.patch('/blogcategories/:id', verifyToken, requireAdmin, updateBlogCategory);
blogCategoryRouter.patch('/blogcategories/status/:id', verifyToken, requireAdmin, toggleBlogCategory);
blogCategoryRouter.delete('/blogcategories/:id', verifyToken, requireAdmin, deleteBlogCategory);

export default blogCategoryRouter;
