"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatingByUserId = exports.getRatingByProductId = exports.createRating = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const rating_model_js_1 = __importDefault(require("../models/rating.model.js"));
const orderdetail_model_js_1 = __importDefault(require("../models/orderdetail.model.js"));
const createRating = async (req, res) => {
    try {
        const { orderDetailId, content, score } = req.body;
        // Lấy userId từ middleware xác thực
        const userId = req.user?._id;
        // Kiểm tra đầu vào
        if (!content || !score || !userId || !orderDetailId) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
            return;
        }
        // Kiểm tra tính hợp lệ của productI
        // Kiểm tra tính hợp lệ của orderDetailId
        const orderDetailExists = await orderdetail_model_js_1.default.findById(orderDetailId);
        if (!orderDetailExists) {
            res.status(404).json({ success: false, message: 'Chi tiết đơn hàng không tồn tại' });
            return;
        }
        // Tạo đánh giá mới
        const newRate = new rating_model_js_1.default({
            _id: orderDetailId,
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
        const { id: productId } = req.params; // Lấy productId từ URL params
        // Kiểm tra tính hợp lệ của productId
        if (!productId || !mongoose_1.default.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ success: false, message: 'Invalid productId' });
            return;
        }
        // Parse productId thành ObjectId
        const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
        // Tìm tất cả các orderDetail có productId này
        const orderDetails = await orderdetail_model_js_1.default.find({ productId: productObjectId }).select('_id');
        if (!orderDetails || orderDetails.length === 0) {
            res.status(404).json({ success: false, message: 'No order details found for this product' });
            return;
        }
        // Lấy danh sách _id của orderDetail
        const orderDetailIds = orderDetails.map((detail) => detail._id);
        // Tìm tất cả các đánh giá có _id trùng với orderDetailIds
        const ratings = await rating_model_js_1.default.find({ _id: { $in: orderDetailIds } }).populate('userId', 'fullname avatar');
        if (!ratings || ratings.length === 0) {
            res.status(404).json({ success: false, message: 'No ratings found for this product' });
            return;
        }
        // Chuẩn bị dữ liệu trả về
        const ratingData = ratings.map((rating) => ({
            userId: rating.userId._id,
            userName: rating.userId.fullname,
            userAvatar: rating.userId.avatar,
            content: rating.content,
            score: rating.score,
            likes: rating.likes,
            createdAt: rating.createdAt
        }));
        res.json({ success: true, data: ratingData });
    }
    catch (error) {
        console.error('Error fetching product ratings:', error);
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};
exports.getRatingByProductId = getRatingByProductId;
const getRatingByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin trong yêu cầu' });
            return;
        }
        const ratings = await rating_model_js_1.default
            .find({ userId: id })
            .populate({ path: 'userId', select: '-password' })
            .populate({ path: '_id' });
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
exports.getRatingByUserId = getRatingByUserId;
//# sourceMappingURL=rate.controllers.js.map