import { get } from 'http';
import { Router } from 'express';

import { protectRoute } from '../middlewares/protectRoute.js';
const userRouter = Router();
import {
  getAllUser,
  updateUser,
  getUserById,
  updateCart,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  changePassword,
  getNewUsers
} from '../controllers/user.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
userRouter.get('/users', verifyToken, getAllUser);
userRouter.get('/users/new', verifyToken, getNewUsers);
userRouter.patch('/users/:id', verifyToken, updateUser);
userRouter.patch('/users/self/cart', verifyToken, updateCart);
userRouter.get('/users/:id', verifyToken, getUserById);
userRouter.post('/users/:id/address', verifyToken, addUserAddress);
userRouter.patch('/users/:id/address/:index', verifyToken, updateUserAddress);
userRouter.delete('/users/:id/address/:index', verifyToken, deleteUserAddress);
userRouter.patch('/users/:id/change-password', verifyToken, changePassword);

export default userRouter;
