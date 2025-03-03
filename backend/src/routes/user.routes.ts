import { get } from 'http';
import { Router } from 'express';

import { protectRoute } from '../middlewares/protectRoute';
const userRouter = Router();
import { getAllUser, updateUser, getUserById } from '../controllers/user.controllers';
import { verifyToken } from '../middlewares/verifyToken';
userRouter.get('/users', verifyToken, getAllUser);
userRouter.patch('/users/:id', verifyToken, updateUser);
userRouter.get('/users/:id', verifyToken, getUserById);

export default userRouter;
