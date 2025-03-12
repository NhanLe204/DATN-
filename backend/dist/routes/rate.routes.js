import { Router } from 'express';
import { getAllRatings, getRatingID, createRating, updateRating, deleteRating } from '../controllers/rate.controllers.js';
const rateRouter = Router();
rateRouter.get('/ratings', getAllRatings);
rateRouter.get('/ratings/:id', getRatingID);
rateRouter.post('/ratings', createRating);
rateRouter.patch('/ratings/:id', updateRating);
rateRouter.delete('/ratings/:id', deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
export default rateRouter;
//# sourceMappingURL=rate.routes.js.map