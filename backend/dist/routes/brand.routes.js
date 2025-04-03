"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const brand_controllers_js_1 = require("../controllers/brand.controllers.js");
const brandRouter = (0, express_1.Router)();
brandRouter.get('/brands', brand_controllers_js_1.getAllBrands);
brandRouter.get('/brands/:id', brand_controllers_js_1.getBrandById);
brandRouter.post('/brands', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, brand_controllers_js_1.insertBrand);
brandRouter.patch('/brands/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, brand_controllers_js_1.updateBrand);
brandRouter.delete('/brands/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, brand_controllers_js_1.deleteBrand);
exports.default = brandRouter;
//# sourceMappingURL=brand.routes.js.map