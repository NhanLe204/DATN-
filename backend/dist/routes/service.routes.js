"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_controllers_js_1 = require("../controllers/service.controllers.js");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const express_1 = require("express");
const serviceRouter = (0, express_1.Router)();
// Định nghĩa các route cho Service
serviceRouter.get('/services', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, service_controllers_js_1.getAllServices); // Lấy tất cả dịch vụ
serviceRouter.post('/services', service_controllers_js_1.createService); // Tạo mới một dịch vụ
serviceRouter.get('/services/status/active', service_controllers_js_1.getServiceActive);
serviceRouter.get('/services/:id', service_controllers_js_1.getServiceById);
serviceRouter.patch('/services/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, service_controllers_js_1.updateService); // Cập nhật dịch vụ theo serviceID
serviceRouter.delete('/services/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, service_controllers_js_1.deleteService);
// serviceRouter.get('/services/:id', getServiceById); // Lấy dịch vụ theo serviceID
// serviceRouter.delete('/services/:id', deleteService); // Xóa dịch vụ theo serviceID
exports.default = serviceRouter;
//# sourceMappingURL=service.routes.js.map