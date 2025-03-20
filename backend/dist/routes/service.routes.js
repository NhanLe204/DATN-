import { Router } from 'express';
import { requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { deleteBrand, getAllBrands, getBrandById, insertBrand, updateBrand } from '../controllers/brand.controllers.js';
const serviceRouter = Router();
serviceRouter.get('/brands', getAllBrands);
serviceRouter.get('/brands/:id', getBrandById);
serviceRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
serviceRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
serviceRouter.delete('/brands/:id', verifyToken, requireAdmin, deleteBrand);
export default serviceRouter;
//# sourceMappingURL=service.routes.js.map