import { Router, Request, Response } from 'express';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  getOrderDetails,
  getOrderDetailsByOrderId,
  getAllBookings,
  getBookingsByUserId,
  getOrderByUserId
} from '@/controllers/orderDetail.controllers.js';

const orderDetailRouter = Router();

orderDetailRouter.get('/ordersDetail', verifyToken, getOrderDetails);
orderDetailRouter.get('/ordersDetail/bookings', verifyToken, getBookingsByUserId);
orderDetailRouter.get('/ordersDetail/allBookings', verifyToken, getAllBookings);
orderDetailRouter.get('/ordersDetail/:id', verifyToken, getOrderDetailsByOrderId);
orderDetailRouter.get('/getOrderByUserId', verifyToken, getOrderByUserId);
// orderRouter.patch('/ratings/:id', updateRating);
// orderRouter.delete('/ratings/:id', deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);

export default orderDetailRouter;
