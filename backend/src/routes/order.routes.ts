import { Router, Request, Response } from 'express';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const orderRouter = Router();

// orderRouter.post('/ratings', );
// orderRouter.get('/ratings', getAllRatings);
// orderRouter.get('/ratings/:id', getRatingID);
// orderRouter.patch('/ratings/:id', updateRating);
// orderRouter.delete('/ratings/:id', deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);

export default orderRouter;
