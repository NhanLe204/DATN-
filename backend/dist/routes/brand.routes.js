import { Router } from 'express';
import { requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getAllBrands, getBrandById, insertBrand, updateBrand } from '../controllers/brand.controllers.js';
const brandRouter = Router();
brandRouter.get('/brands', getAllBrands);
brandRouter.get('/brands/:id', getBrandById);
brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
export default brandRouter;
//# sourceMappingURL=brand.routes.js.map