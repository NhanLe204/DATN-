import { Router } from 'express';
const userRouter = Router();
import { getAllUser, updateUser, getUserById } from '../controllers/user.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
userRouter.get('/users', verifyToken, getAllUser);
userRouter.patch('/users/:id', verifyToken, updateUser);
userRouter.get('/users/:id', verifyToken, getUserById);
export default userRouter;
//# sourceMappingURL=user.routes.js.map