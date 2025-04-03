"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogById = exports.getActiveBlogs = exports.getAllBlogs = exports.createBlog = void 0;
const blog_model_js_1 = __importDefault(require("../models/blog.model.js"));
const blog_enum_js_1 = require("../enums/blog.enum.js");
const createBlog = async (req, res) => {
    try {
        const { title, content, image_url, author, product, user, status } = req.body;
        if (!title || !content || !author || !product || !user) {
            res
                .status(400)
                .json({ success: false, message: 'Missing required fields: title, content, author, product, user' });
            return;
        }
        const newBlog = new blog_model_js_1.default({
            title,
            content,
            image_url: image_url || [],
            author,
            product,
            user,
            status: status || blog_enum_js_1.BlogStatus.ACTIVE
        });
        const savedBlog = await newBlog.save();
        res.status(201).json({ success: true, message: 'Blog created successfully', data: savedBlog });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error when creating blog',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createBlog = createBlog;
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await blog_model_js_1.default.find();
        res.status(200).json({ success: true, data: blogs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error when fetching blogs' });
    }
};
exports.getAllBlogs = getAllBlogs;
const getActiveBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const blogs = await blog_model_js_1.default.find({ status: blog_enum_js_1.BlogStatus.ACTIVE }).skip(skip).limit(limit);
        const total = await blog_model_js_1.default.countDocuments({ status: blog_enum_js_1.BlogStatus.ACTIVE });
        res.status(200).json({
            success: true,
            data: blogs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error when fetching active blogs' });
    }
};
exports.getActiveBlogs = getActiveBlogs;
// Get a blog by ID
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blog_model_js_1.default.findById(id);
        if (!blog) {
            res.status(404).json({ success: false, message: 'Blog not found' });
            return;
        }
        res.status(200).json({ success: true, data: blog });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error when fetching blog' });
    }
};
exports.getBlogById = getBlogById;
// Update a blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image_url, author, status } = req.body;
        const blog = await blog_model_js_1.default.findById(id);
        if (!blog) {
            res.status(404).json({ success: false, message: 'Blog not found' });
            return;
        }
        if (title)
            blog.title = title;
        if (content)
            blog.content = content;
        if (image_url)
            blog.image_url = image_url;
        if (author)
            blog.author = author;
        if (status && Object.values(blog_enum_js_1.BlogStatus).includes(status))
            blog.status = status;
        const updatedBlog = await blog.save();
        res.status(200).json({ success: true, message: 'Blog updated successfully', data: updatedBlog });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error when updating blog' });
    }
};
exports.updateBlog = updateBlog;
// Delete a blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blog_model_js_1.default.findById(id);
        if (!blog) {
            res.status(404).json({ success: false, message: 'Blog not found' });
            return;
        }
        await blog_model_js_1.default.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error when deleting blog' });
    }
};
exports.deleteBlog = deleteBlog;
//# sourceMappingURL=blog.controllers.js.map