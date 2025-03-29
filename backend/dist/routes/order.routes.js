import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { createOrderAfterPayment, getAllOrders, getOrderById, getAvailableSlots } from '../controllers/order.controllers.js';
const orderRouter = Router();
orderRouter.get('/orders', verifyToken, getAllOrders);
orderRouter.post('/orders', verifyToken, createOrderAfterPayment);
orderRouter.get('/orders/check/available-slots', verifyToken, getAvailableSlots);
orderRouter.get('/orders/:id', verifyToken, getOrderById);
// orderRouter.patch('/ratings/:id', updateRating);
// orderRouter.delete('/ratings/:id', deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
export default orderRouter;
//# sourceMappingURL=order.routes.js.map