"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const rate_controllers_js_1 = require("../controllers/rate.controllers.js");
const rateRouter = (0, express_1.Router)();
// http://localhost:5000/api/v1/ratings
rateRouter.post('/ratings', verifyToken_js_1.verifyToken, rate_controllers_js_1.createRating);
rateRouter.get('/ratings/:id', rate_controllers_js_1.getRatingByProductId);
// rateRouter.get('/ratings/:id', getRatingID);
// rateRouter.post('/ratings', createRating);
// rateRouter.patch('/ratings/:id', updateRating);
// rateRouter.delete('/ratings/:id', deleteRating);
// // brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// // brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// // categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
exports.default = rateRouter;
//# sourceMappingURL=rating.routes.js.map