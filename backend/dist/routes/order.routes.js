"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const order_controllers_js_1 = require("../controllers/order.controllers.js");
const orderRouter = (0, express_1.Router)();
orderRouter.get('/orders', verifyToken_js_1.verifyToken, order_controllers_js_1.getAllOrders);
orderRouter.post('/orders', order_controllers_js_1.createOrderAfterPayment);
orderRouter.get('/orders/check/available-slots', order_controllers_js_1.getAvailableSlots);
orderRouter.get('/orders/:id', verifyToken_js_1.verifyToken, order_controllers_js_1.getOrderById);
orderRouter.patch('/orders/status/:id', verifyToken_js_1.verifyToken, order_controllers_js_1.updateOrderStatus);
// orderRouter.delete('/ratings/:id', deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
exports.default = orderRouter;
//# sourceMappingURL=order.routes.js.map