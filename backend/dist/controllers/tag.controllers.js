"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTag = exports.deleteTag = exports.insertTag = exports.getTagById = exports.getAllTags = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tag_model_js_1 = __importDefault(require("../models/tag.model.js"));
const getAllTags = async (req, res) => {
    try {
        const result = await tag_model_js_1.default.find();
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error brand up: ${error.message}`);
            return;
        }
        else {
            console.error('Error brand up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getAllTags = getAllTags;
const getTagById = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await tag_model_js_1.default.findById(id);
        if (!tag) {
            res.status(404).json({ message: 'Tag name này không tồn tại' });
            return;
        }
        res.status(200).json({ message: 'Lấy tag name của sản phẩm thành công', tag });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error tag up: ${error.message}`);
            return;
        }
        else {
            console.error('Error tag up:', error);
            return;
        }
    }
};
exports.getTagById = getTagById;
const insertTag = async (req, res) => {
    try {
        const { tag_name } = req.body;
        if (!tag_name) {
            res.status(400).json({
                success: false,
                message: 'Please provide an tag name'
            });
        }
        const existingNameBrand = await tag_model_js_1.default.findOne({ tag_name });
        if (existingNameBrand) {
            res.status(400).json({
                success: false,
                message: 'Tag with this name already exists'
            });
        }
        const newTag = new tag_model_js_1.default({
            tag_name
        });
        await newTag.save();
        res.status(201).json({
            success: true,
            tag: { ...newTag._doc }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error tag up: ${error.message}`);
        }
        else {
            console.error('Error tag up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.insertTag = insertTag;
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await tag_model_js_1.default.findByIdAndDelete(id);
        if (!result) {
            res.status(404).json({ message: 'Tag not found' });
            return;
        }
        res.status(200).json({ message: 'Tag deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Server error', error });
        }
    }
};
exports.deleteTag = deleteTag;
const updateTag = async (req, res) => {
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
        const { tag_name } = req.body;
        // Tìm và cập nhật tên thương hiệu
        const updatedTag = await tag_model_js_1.default.findByIdAndUpdate(id, { tag_name }, { new: true, runValidators: true });
        if (!updatedTag) {
            res.status(404).json({ success: false, message: 'Tag Name không tồn tại' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Tên thương hiệu được cập nhật thành công', updatedTag: updatedTag });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Lỗi khi cập nhật tag-name: ${error.message}`);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
        else {
            console.error('Lỗi không xác định khi cập nhật tag-name:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};
exports.updateTag = updateTag;
//# sourceMappingURL=tag.controllers.js.map