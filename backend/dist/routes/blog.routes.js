"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controllers_js_1 = require("../controllers/blog.controllers.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const cloudinary_config_js_1 = __importDefault(require("../config/cloudinary.config.js"));
const blogRouter = (0, express_1.Router)();
// Lấy tất cả bài viết
blogRouter.get('/blogs', blog_controllers_js_1.getAllBlogs);
// Lấy bài viết theo ID
blogRouter.get('/blogs/:id', blog_controllers_js_1.getBlogById);
// Tạo bài viết mới (yêu cầu xác thực và quyền admin)
blogRouter.post('/blogs', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, cloudinary_config_js_1.default.single('image_url'), blog_controllers_js_1.createBlog);
// Cập nhật bài viết theo ID (yêu cầu xác thực và quyền admin)
blogRouter.patch('/blogs/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, cloudinary_config_js_1.default.single('image_url'), blog_controllers_js_1.updateBlog);
// Xóa bài viết theo ID (yêu cầu xác thực và quyền admin)
blogRouter.delete('/blogs/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, blog_controllers_js_1.deleteBlog);
exports.default = blogRouter;
//# sourceMappingURL=blog.routes.js.map