"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rate_controllers_js_1 = require("../controllers/rate.controllers.js");
const rateRouter = (0, express_1.Router)();
// http://localhost:5000/api/v1/ratings
rateRouter.get('/ratings', rate_controllers_js_1.getAllRatings);
rateRouter.get('/ratings/:id', rate_controllers_js_1.getRatingID);
rateRouter.post('/ratings', rate_controllers_js_1.createRating);
rateRouter.patch('/ratings/:id', rate_controllers_js_1.updateRating);
rateRouter.delete('/ratings/:id', rate_controllers_js_1.deleteRating);
// brandRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// brandRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// categoryRouter.delete('/categories/:id', protectRoute, requireAdmin, toggleCategory);
exports.default = rateRouter;
//# sourceMappingURL=rate.routes.js.map