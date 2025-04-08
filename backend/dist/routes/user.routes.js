'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const userRouter = (0, express_1.Router)();
const user_controllers_js_1 = require('../controllers/user.controllers.js');
const verifyToken_js_1 = require('../middlewares/verifyToken.js');
const cloudinary_config_js_1 = __importDefault(require('../config/cloudinary.config.js'));
// http://localhost:3000/api/v1/users
userRouter.get('/users', verifyToken_js_1.verifyToken, user_controllers_js_1.getAllUser);
userRouter.get('/users/new', verifyToken_js_1.verifyToken, user_controllers_js_1.getNewUsers);
userRouter.patch(
  '/users/:id',
  verifyToken_js_1.verifyToken,
  cloudinary_config_js_1.default.single('avatar'),
  user_controllers_js_1.updateUser
);
userRouter.patch('/users/self/cart', verifyToken_js_1.verifyToken, user_controllers_js_1.updateCart);
userRouter.get('/users/:id', verifyToken_js_1.verifyToken, user_controllers_js_1.getUserById);
userRouter.post('/users/:id/address', verifyToken_js_1.verifyToken, user_controllers_js_1.addUserAddress);
userRouter.patch('/users/:id/address/:index', verifyToken_js_1.verifyToken, user_controllers_js_1.updateUserAddress);
userRouter.delete('/users/:id/address/:index', verifyToken_js_1.verifyToken, user_controllers_js_1.deleteUserAddress);
userRouter.patch('/users/:id/change-password', verifyToken_js_1.verifyToken, user_controllers_js_1.changePassword);
userRouter.patch(
  '/users/:id/set-default/:index',
  verifyToken_js_1.verifyToken,
  user_controllers_js_1.setDefaultAddress
);
exports.default = userRouter;
//# sourceMappingURL=user.routes.js.map
