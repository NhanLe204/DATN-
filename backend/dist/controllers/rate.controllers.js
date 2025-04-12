"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatingByProductId = exports.createRating = void 0;
const rating_model_js_1 = __importDefault(require("../models/rating.model.js"));
const createRating = async (req, res) => {
    try {
        const { productId, orderDetailId, content, userId, score } = req.body;
        console.log(productId, orderDetailId, content, userId, score);
        if (!productId || !content || !score || !userId || !orderDetailId) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
            return;
        }
        const newRate = new rating_model_js_1.default({
            productId,
            userId,
            orderDetailId,
            content,
            score
        });
        const savedRate = await newRate.save();
        res.status(201).json({
            success: true,
            message: 'Tạo đánh giá thành công',
            data: savedRate
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to create rating', details: errorMessage });
    }
};
exports.createRating = createRating;
const getRatingByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
            return;
        }
        const ratings = await rating_model_js_1.default.find({ productId }).populate('userId', 'orderDetailId');
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đánh giá thành công',
            data: ratings
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to get rating', details: errorMessage });
    }
};
exports.getRatingByProductId = getRatingByProductId;
//# sourceMappingURL=rate.controllers.js.map