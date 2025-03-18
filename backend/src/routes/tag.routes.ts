import { Router, Request, Response } from 'express';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getAllTags, getTagById, insertTag, deleteTag } from '../controllers/tag.controllers.js';
import { deleteRating } from '@/controllers/rate.controllers.js';

const tagRouter = Router();

tagRouter.get('/tags', verifyToken, getAllTags);
tagRouter.get('/tags/:id', verifyToken, getTagById);
tagRouter.post('/tags', verifyToken, requireAdmin, insertTag);
tagRouter.delete('/tags/:id', verifyToken, requireAdmin, deleteTag);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);

// brandRouter.get('/brands/:id', getBrandById);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);

export default tagRouter;
