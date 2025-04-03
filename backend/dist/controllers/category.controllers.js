"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.getCategoriesActive = exports.toggleCategory = exports.updateCategory = exports.insertCategory = exports.getCategoryById = exports.getAllCategory = void 0;
const category_model_js_1 = __importDefault(require("../models/category.model.js"));
const category_enum_js_1 = require("../enums/category.enum.js");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllCategory = async (req, res) => {
    try {
        const result = await category_model_js_1.default.find();
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
exports.getAllCategory = getAllCategory;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await category_model_js_1.default.findById(id);
        if (!category) {
            res.status(404).json({ message: 'Không tìm thấy danh mục' });
            return;
        }
        res.status(200).json({ message: 'Lấy danh mục thành công', category });
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
exports.getCategoryById = getCategoryById;
const insertCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            res.status(400).json({
                success: false,
                message: 'Please provide an name and description product'
            });
        }
        const existingNameCategory = await category_model_js_1.default.findOne({ name });
        if (existingNameCategory) {
            res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        const newCategory = new category_model_js_1.default({
            name,
            description
        });
        await newCategory.save();
        res.status(201).json({
            success: true,
            user: { ...newCategory._doc }
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
exports.insertCategory = insertCategory;
// vẫn để nó hoạt động ( những chuyển qua api khác)
const updateCategory = async (req, res) => {
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
        if (!name || !description || status === undefined) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tên, mô tả và trạng thái danh mục'
            });
            return;
        }
        if (!Object.values(category_enum_js_1.CategoryStatus).includes(status)) {
            res.status(400).json({ success: false, message: 'Trạng thái danh mục không hợp lệ' });
            return;
        }
        // Tìm và cập nhật danh mục
        const updatedCategory = await category_model_js_1.default.findByIdAndUpdate(id, { name, description, status }, { new: true, runValidators: true });
        if (!updatedCategory) {
            res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
            return;
        }
        res.status(200).json({ success: true, message: 'Danh mục được cập nhật thành công', category: updatedCategory });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Lỗi khi cập nhật danh mục: ${error.message}`);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
        else {
            console.error('Lỗi không xác định khi cập nhật danh mục:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};
exports.updateCategory = updateCategory;
const toggleCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        console.log('ID Category:', id);
        console.log('Status Category:', status);
        if (!id) {
            res.status(400).json({ message: 'Vui lòng cung cấp ID danh mục' });
            return;
        }
        // Kiểm tra status có hợp lệ không
        const statusString = String(status).toLowerCase();
        if (!Object.values(category_enum_js_1.CategoryStatus).includes(statusString)) {
            res.status(400).json({
                message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "active" hoặc "inactive"'
            });
            return;
        }
        // Tìm danh mục theo ID
        const category = await category_model_js_1.default.findById(id);
        if (!category) {
            res.status(404).json({ message: 'Danh mục không tồn tại' });
            return;
        }
        // Chuyển đổi status sang boolean (inactive = true, active = false)
        const isHidden = statusString === category_enum_js_1.CategoryStatus.INACTIVE;
        // Cập nhật trạng thái `isHidden`
        category.status = isHidden ? 'inactive' : 'active';
        await category.save();
        res.status(200).json({
            message: isHidden ? 'Danh mục đã được ẩn thành công' : 'Danh mục đã mở lại thành công',
            category
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái danh mục', error });
        return;
    }
};
exports.toggleCategory = toggleCategory;
const getCategoriesActive = async (req, res) => {
    try {
        const result = await category_model_js_1.default.find({ status: category_enum_js_1.CategoryStatus.ACTIVE });
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
};
exports.getCategoriesActive = getCategoriesActive;
// Xóa category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await category_model_js_1.default.findById(id);
        if (!category) {
            res.status(404).json({ message: 'Không tìm thấy danh mục' });
            return;
        }
        await category_model_js_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Xóa danh mục thành công' });
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
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controllers.js.map