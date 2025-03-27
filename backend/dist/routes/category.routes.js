import { Router } from 'express';
import { getAllCategory, toggleCategory, insertCategory, updateCategory, getCategoryById, getCategoriesActive } from '../controllers/category.controllers.js';
import { requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
const categoryRouter = Router();
// http://localhost:5000/api/v1/categories
categoryRouter.get('/categories', getAllCategory);
categoryRouter.get('/categories/:id', getCategoryById);
categoryRouter.get('/categories/status/active', getCategoriesActive);
categoryRouter.post('/categories', verifyToken, requireAdmin, insertCategory);
categoryRouter.patch('/categories/:id', verifyToken, requireAdmin, updateCategory);
categoryRouter.patch('/categories/status/:id', verifyToken, requireAdmin, toggleCategory);
export default categoryRouter;
//# sourceMappingURL=category.routes.js.map