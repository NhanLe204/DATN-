"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRating = exports.updateRating = exports.createRating = exports.getRatingID = exports.getAllRatings = void 0;
const rate_model_js_1 = __importDefault(require("../models/rate.model.js"));
const getAllRatings = async (req, res) => {
    try {
        // .populate('orderDetailID');
        const ratings = await rate_model_js_1.default.find();
        res.status(200).json({ success: true, data: ratings });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách rating', error });
    }
};
exports.getAllRatings = getAllRatings;
const getRatingID = async (req, res) => {
    try {
        const { id } = req.params;
        // .populate('orderDetailID');
        const rate = await rate_model_js_1.default.findById(id);
        // .populate('orderDetailID');
        if (!rate) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
            return;
        }
        res.status(200).json({ success: true, data: rate });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching rate: ${error.message}`);
        }
        else {
            console.error('Error fetching rate:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getRatingID = getRatingID;
const createRating = async (req, res) => {
    try {
        const { orderDetailID, score } = req.body;
        console.log(orderDetailID, score);
        const newRating = await rate_model_js_1.default.create({ orderDetailID, score });
        res.status(201).json(newRating);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to create rating', details: errorMessage });
    }
};
exports.createRating = createRating;
const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body;
        const rate = await rate_model_js_1.default.findByIdAndUpdate(id, { score }, { new: true });
        // .populate('orderDetailID');
        if (!rate) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá để cập nhật' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật đánh giá thành công',
            data: rate
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating rate: ${error.message}`);
        }
        else {
            console.error('Error updating rate:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.updateRating = updateRating;
const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const rate = await rate_model_js_1.default.findByIdAndDelete(id);
        if (!rate) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá để xóa' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Xóa đánh giá thành công'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting rate: ${error.message}`);
        }
        else {
            console.error('Error deleting rate:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.deleteRating = deleteRating;
//# sourceMappingURL=rate.controllers.js.map