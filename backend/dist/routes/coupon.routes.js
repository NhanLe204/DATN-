"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const coupon_controllers_js_1 = require("../controllers/coupon.controllers.js");
// import { getAllBrands, getBrandById, insertBrand, updateBrand } from '../controllers/brand.controllers.js';
const couponRouter = (0, express_1.Router)();
// http://localhost:3000/api/v1/coupons
couponRouter.get('/coupons', coupon_controllers_js_1.getAllCoupon);
couponRouter.get('/coupons/active', coupon_controllers_js_1.getActiveCoupons);
couponRouter.get('/coupons/:id', coupon_controllers_js_1.getCouponById);
couponRouter.post('/coupons', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, coupon_controllers_js_1.createCoupon);
couponRouter.delete('/coupons/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, coupon_controllers_js_1.deleteCouponById);
couponRouter.patch('/coupons/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, coupon_controllers_js_1.updateCoupon);
couponRouter.post('/coupons/apply', verifyToken_js_1.verifyToken, coupon_controllers_js_1.applyCoupon);
// couponRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// couponRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
exports.default = couponRouter;
//# sourceMappingURL=coupon.routes.js.map