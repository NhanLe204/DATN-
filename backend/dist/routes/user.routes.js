import { Router } from 'express';
const userRouter = Router();
import { getAllUser, updateUser, getUserById, updateCart, addUserAddress, getNewUsers } from '../controllers/user.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
userRouter.get('/users', verifyToken, getAllUser);
userRouter.get('/users/new', verifyToken, getNewUsers);
userRouter.patch('/users/:id', verifyToken, updateUser);
userRouter.patch('/users/self/cart', verifyToken, updateCart);
userRouter.get('/users/:id', verifyToken, getUserById);
userRouter.post('/users/:id/address', verifyToken, addUserAddress);
export default userRouter;
//# sourceMappingURL=user.routes.js.map