"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogCategory_controllers_js_1 = require("../controllers/blogCategory.controllers.js");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const blogCategoryRouter = (0, express_1.Router)();
// http://localhost:5000/api/v1/categories
blogCategoryRouter.get('/blogcategories', blogCategory_controllers_js_1.getAllBlogCategory);
blogCategoryRouter.get('/blogcategories/:id', blogCategory_controllers_js_1.getBlogCategoryById);
blogCategoryRouter.get('/blogcategories/status/active', blogCategory_controllers_js_1.getBlogCategoriesActive);
blogCategoryRouter.post('/blogcategories', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, blogCategory_controllers_js_1.insertBlogCategory);
blogCategoryRouter.patch('/blogcategories/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, blogCategory_controllers_js_1.updateBlogCategory);
blogCategoryRouter.patch('/blogcategories/status/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, blogCategory_controllers_js_1.toggleBlogCategory);
blogCategoryRouter.delete('/blogcategories/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, blogCategory_controllers_js_1.deleteBlogCategory);
exports.default = blogCategoryRouter;
//# sourceMappingURL=blogCategory.routes.js.map