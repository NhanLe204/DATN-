import { Router, Request, Response } from 'express';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute';
import { verifyToken } from '../middlewares/verifyToken';
import { getAllBrands, getBrandById, insertBrand, updateBrand } from '../controllers/brand.controllers';

const brandRouter = Router();

brandRouter.get('/brands', getAllBrands);
brandRouter.get('/brands/:id', getBrandById);
brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);

export default brandRouter;
