import { Router, Request, Response } from 'express';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  createOrderAfterPayment,
  getAllOrders,
  getOrderById,
  getAvailableSlots,
  updateOrderStatus
} from '../controllers/order.controllers.js';

const orderRouter = Router();

orderRouter.get('/orders', verifyToken, getAllOrders);
orderRouter.post('/orders', createOrderAfterPayment);
orderRouter.get('/orders/check/available-slots', getAvailableSlots);
orderRouter.get('/orders/:id', verifyToken, getOrderById);
orderRouter.patch('/orders/status/:id', verifyToken, updateOrderStatus);
// orderRouter.delete('/ratings/:id', deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);

export default orderRouter;
