"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const delivery_controllers_js_1 = require("@/controllers/delivery.controllers.js");
const deliveryRouter = (0, express_1.Router)();
deliveryRouter.get('/delivery', delivery_controllers_js_1.getAllDeliveries);
deliveryRouter.get('/delivery/:id', delivery_controllers_js_1.getDeliveryById);
deliveryRouter.post('/delivery', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, delivery_controllers_js_1.insertDelivery);
deliveryRouter.patch('/delivery/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, delivery_controllers_js_1.updateDelivery);
deliveryRouter.delete('/delivery/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, delivery_controllers_js_1.deleteDelivery);
exports.default = deliveryRouter;
//# sourceMappingURL=delivery.routes.js.map