"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controllers_js_1 = require("../controllers/category.controllers.js");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const categoryRouter = (0, express_1.Router)();
// http://localhost:5000/api/v1/categories
categoryRouter.get('/categories', category_controllers_js_1.getAllCategory);
categoryRouter.get('/categories/:id', category_controllers_js_1.getCategoryById);
categoryRouter.get('/categories/status/active', category_controllers_js_1.getCategoriesActive);
categoryRouter.post('/categories', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, category_controllers_js_1.insertCategory);
categoryRouter.patch('/categories/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, category_controllers_js_1.updateCategory);
categoryRouter.patch('/categories/status/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, category_controllers_js_1.toggleCategory);
categoryRouter.delete('/categories/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, category_controllers_js_1.deleteCategory);
exports.default = categoryRouter;
//# sourceMappingURL=category.routes.js.map