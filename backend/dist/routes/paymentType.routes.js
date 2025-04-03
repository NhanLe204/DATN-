"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const paymentType_controllers_js_1 = require("@/controllers/paymentType.controllers.js");
const paymentTypeRouter = (0, express_1.Router)();
paymentTypeRouter.get('/payments', paymentType_controllers_js_1.getAllPayments);
paymentTypeRouter.get('/payments/:id', paymentType_controllers_js_1.getPaymentById);
paymentTypeRouter.post('/payments', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, paymentType_controllers_js_1.insertPayment);
paymentTypeRouter.patch('/payments/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, paymentType_controllers_js_1.updatePayment);
paymentTypeRouter.delete('/payments/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, paymentType_controllers_js_1.deletePayments);
exports.default = paymentTypeRouter;
//# sourceMappingURL=paymentType.routes.js.map