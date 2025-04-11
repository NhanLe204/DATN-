"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBlogCategory = exports.deleteBlogCategory = exports.getBlogCategoriesActive = exports.updateBlogCategory = exports.getBlogCategoryById = exports.insertBlogCategory = exports.getAllBlogCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blogCategory_model_js_1 = __importDefault(require("../models/blogCategory.model.js"));
const blogCategory_enum_js_1 = require("../enums/blogCategory.enum.js");
const getAllBlogCategory = async (req, res) => {
    try {
        const result = await blogCategory_model_js_1.default.find();
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error category up: ${error.message}`);
        }
        else {
            console.error('Error category up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getAllBlogCategory = getAllBlogCategory;
const insertBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Please provide an name and description product'
            });
            return;
        }
        const existingNameBlogCategory = await blogCategory_model_js_1.default.findOne({ name });
        if (existingNameBlogCategory) {
            res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
            return;
        }
        const newBlogCategory = new blogCategory_model_js_1.default({
            name,
            description
        });
        await newBlogCategory.save();
        res.status(201).json({
            success: true,
            user: { ...newBlogCategory._doc }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error category up: ${error.message}`);
        }
        else {
            console.error('Error category up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.insertBlogCategory = insertBlogCategory;
const getBlogCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await blogCategory_model_js_1.default.findById(id);
        if (!category) {
            res.status(404).json({ message: 'Không tìm thấy danh mục bài viết' });
            return;
        }
        res.status(200).json({ message: 'Lấy danh mục bài viết thành công', category });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error category up: ${error.message}`);
            return;
        }
        else {
            console.error('Error category up:', error);
            return;
        }
    }
};
exports.getBlogCategoryById = getBlogCategoryById;
const updateBlogCategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, 'ID');
        // Kiểm tra xem ID có hợp lệ không
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
            return;
        }
        const { name, description, status } = req.body;
        if (!name || status === undefined) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tên, mô tả và trạng thái danh mục bài viết'
            });
            return;
        }
        if (!Object.values(blogCategory_enum_js_1.BlogCategoryStatus).includes(status)) {
            res.status(400).json({ success: false, message: 'Trạng thái danh mục bài viết không hợp lệ' });
            return;
        }
        // Tìm và cập nhật danh mục bài viết
        const updatedBlogCategory = await blogCategory_model_js_1.default.findByIdAndUpdate(id, { name, description, status }, { new: true, runValidators: true });
        if (!updatedBlogCategory) {
            res.status(404).json({ success: false, message: 'Danh mục bài viết không tồn tại' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Danh mục bài viết được cập nhật thành công',
            blogCategory: updatedBlogCategory
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Lỗi khi cập nhật danh mục bài viết: ${error.message}`);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
        else {
            console.error('Lỗi không xác định khi cập nhật danh mục bài viết:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};
exports.updateBlogCategory = updateBlogCategory;
const getBlogCategoriesActive = async (req, res) => {
    try {
        const result = await blogCategory_model_js_1.default.find({ status: blogCategory_enum_js_1.BlogCategoryStatus.ACTIVE });
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
};
exports.getBlogCategoriesActive = getBlogCategoriesActive;
// Xóa category
const deleteBlogCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const blogCategory = await blogCategory_model_js_1.default.findById(id);
        if (!blogCategory) {
            res.status(404).json({ message: 'Không tìm thấy danh mục bài viết' });
            return;
        }
        await blogCategory_model_js_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Xóa danh mục bài viết thành công' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error category up: ${error.message}`);
            return;
        }
        else {
            console.error('Error category up:', error);
            return;
        }
    }
};
exports.deleteBlogCategory = deleteBlogCategory;
const toggleBlogCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        console.log('ID Category:', id);
        console.log('Status Category:', status);
        if (!id) {
            res.status(400).json({ message: 'Vui lòng cung cấp ID danh mục bài viết' });
            return;
        }
        // Kiểm tra status có hợp lệ không
        const statusString = String(status).toLowerCase();
        if (!Object.values(blogCategory_enum_js_1.BlogCategoryStatus).includes(statusString)) {
            res.status(400).json({
                message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "active" hoặc "inactive"'
            });
            return;
        }
        // Tìm danh mục bài viết theo ID
        const blogCategory = await blogCategory_model_js_1.default.findById(id);
        if (!blogCategory) {
            res.status(404).json({ message: 'Danh mục bài viết không tồn tại' });
            return;
        }
        // Chuyển đổi status sang boolean (inactive = true, active = false)
        const isHidden = statusString === blogCategory_enum_js_1.BlogCategoryStatus.INACTIVE;
        // Cập nhật trạng thái `isHidden`
        blogCategory.status = isHidden ? 'inactive' : 'active';
        await blogCategory.save();
        res.status(200).json({
            message: isHidden ? 'Danh mục bài viết đã được ẩn thành công' : 'Danh mục bài viết đã mở lại thành công',
            blogCategory
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái danh mục bài viết', error });
        return;
    }
};
exports.toggleBlogCategory = toggleBlogCategory;
//# sourceMappingURL=blogCategory.controllers.js.map