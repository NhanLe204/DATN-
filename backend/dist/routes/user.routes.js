import { Router } from 'express';
const userRouter = Router();
import { getAllUser, updateUser, getUserById, updateCart, addUserAddress, updateUserAddress, deleteUserAddress, changePassword, getNewUsers, setDefaultAddress } from '../controllers/user.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import uploader from '../config/cloudinary.config.js';
// http://localhost:3000/api/v1/users
userRouter.get('/users', verifyToken, getAllUser);
userRouter.get('/users/new', verifyToken, getNewUsers);
userRouter.patch('/users/:id', verifyToken, uploader.single('avatar'), updateUser);
userRouter.patch('/users/self/cart', verifyToken, updateCart);
userRouter.get('/users/:id', verifyToken, getUserById);
userRouter.post('/users/:id/address', verifyToken, addUserAddress);
userRouter.patch('/users/:id/address/:index', verifyToken, updateUserAddress);
userRouter.delete('/users/:id/address/:index', verifyToken, deleteUserAddress);
userRouter.patch('/users/:id/change-password', verifyToken, changePassword);
userRouter.patch('/users/:id/set-default/:index', verifyToken, setDefaultAddress);
export default userRouter;
//# sourceMappingURL=user.routes.js.map