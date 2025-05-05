"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveCoupons = exports.applyCoupon = exports.updateCoupon = exports.deleteCouponById = exports.createCoupon = exports.getCouponById = exports.getAllCoupon = void 0;
const coupon_model_js_1 = __importDefault(require("../models/coupon.model.js"));
const coupon_enum_js_1 = require("../enums/coupon.enum.js");
const getAllCoupon = async (req, res) => {
    try {
        const result = await coupon_model_js_1.default.find();
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error coupon up: ${error.message}`);
            return;
        }
        else {
            console.error('Error coupon up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getAllCoupon = getAllCoupon;
const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await coupon_model_js_1.default.findById(id);
        if (!coupon) {
            res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            return;
        }
        res.status(200).json({ message: 'Lấy mã giảm giá thành công', coupon });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error coupon up: ${error.message}`);
            return;
        }
        else {
            console.error('Error coupon up:', error);
            return;
        }
    }
};
exports.getCouponById = getCouponById;
const createCoupon = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Kiểm tra dữ liệu gửi lên
        const { coupon_code, discount_value, min_order_value, start_date, end_date, usage_limit, used_count, score } = req.body;
        if (!coupon_code || !discount_value || !start_date || !end_date) {
            console.log('Missing required fields');
            res.status(400).json({ success: false, message: 'Thiếu các trường bắt buộc' });
            return;
        }
        const newCoupon = await coupon_model_js_1.default.create({
            coupon_code,
            discount_value,
            min_order_value: min_order_value || 0,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            usage_limit: usage_limit || 1,
            used_count: used_count || 0,
            score: score || 0
        });
        console.log('New coupon created:', newCoupon); // Kiểm tra coupon vừa tạo
        res.status(201).json({ success: true, message: 'Tạo mã giảm giá thành công', coupon: newCoupon });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating coupon: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
exports.createCoupon = createCoupon;
const deleteCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await coupon_model_js_1.default.findByIdAndDelete(id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để xóa' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Xoá mã giảm giá thành công',
            coupon
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting coupon: ${error.message}`);
        }
        else {
            console.error('Error deleting coupon:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.deleteCouponById = deleteCouponById;
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { coupon_code, discount_value, min_order_value, start_date, end_date, usage_limit, used_count, score } = req.body;
        // Tìm coupon hiện tại để kiểm tra start_date nếu không gửi lên
        const existingCoupon = await coupon_model_js_1.default.findById(id);
        if (!existingCoupon) {
            res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để cập nhật' });
            return;
        }
        // Nếu không gửi start_date hoặc end_date, sử dụng giá trị hiện tại
        const updateData = {
            coupon_code,
            discount_value,
            min_order_value,
            start_date: start_date ? new Date(start_date) : existingCoupon.start_date,
            end_date: end_date ? new Date(end_date) : existingCoupon.end_date,
            usage_limit,
            used_count
        };
        // Tự động cập nhật status dựa trên ngày và số lần sử dụng
        const currentDate = new Date();
        if ((updateData.end_date && updateData.end_date < currentDate) ||
            (updateData.used_count ?? 0) >= (updateData.usage_limit ?? 0)) {
            updateData.status = coupon_enum_js_1.CouponStatus.INACTIVE;
        }
        else if (updateData.start_date &&
            updateData.end_date &&
            updateData.start_date <= currentDate &&
            updateData.end_date >= currentDate) {
            updateData.status = coupon_enum_js_1.CouponStatus.ACTIVE;
        }
        const updatedCoupon = await coupon_model_js_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedCoupon) {
            res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá để cập nhật' });
            return;
        }
        res.status(200).json({ success: true, message: 'Cập nhật mã giảm giá thành công', coupon: updatedCoupon });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error updating coupon: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
exports.updateCoupon = updateCoupon;
const applyCoupon = async (req, res) => {
    try {
        const { coupon_code } = req.body;
        const coupon = await coupon_model_js_1.default.findOne({ coupon_code });
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại' });
            return;
        }
        const currentDate = new Date();
        if (coupon.status !== coupon_enum_js_1.CouponStatus.ACTIVE) {
            res.status(400).json({ success: false, message: 'Mã giảm giá không còn hiệu lực (trạng thái không hoạt động)' });
            return;
        }
        if (currentDate < coupon.start_date || currentDate > coupon.end_date) {
            coupon.status = coupon_enum_js_1.CouponStatus.INACTIVE;
            await coupon.save();
            res.status(400).json({ success: false, message: 'Mã giảm giá không còn hiệu lực (hết hạn)' });
            return;
        }
        if (coupon.used_count >= coupon.usage_limit) {
            coupon.status = coupon_enum_js_1.CouponStatus.INACTIVE;
            await coupon.save();
            res.status(400).json({ success: false, message: 'Mã giảm giá đã vượt quá số lần sử dụng cho phép' });
            return;
        }
        coupon.used_count += 1;
        if (coupon.used_count >= coupon.usage_limit) {
            coupon.status = coupon_enum_js_1.CouponStatus.INACTIVE;
        }
        await coupon.save();
        res.status(200).json({
            success: true,
            message: 'Áp dụng mã giảm giá thành công',
            coupon: {
                coupon_code: coupon.coupon_code,
                discount_value: coupon.discount_value,
                used_count: coupon.used_count,
                usage_limit: coupon.usage_limit
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error applying coupon: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
exports.applyCoupon = applyCoupon;
const getActiveCoupons = async (req, res) => {
    try {
        const currentDate = new Date();
        console.log('Fetching active coupons with date:', currentDate);
        const activeCoupons = await coupon_model_js_1.default.find({
            status: 'active',
            start_date: { $lte: currentDate },
            end_date: { $gte: currentDate },
            $expr: { $lt: ['$used_count', '$usage_limit'] }
        });
        console.log('Found coupons:', activeCoupons);
        res.status(200).json({ success: true, result: activeCoupons });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error coupon up: ${error.message}`);
            return;
        }
        else {
            console.error('Error coupon up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getActiveCoupons = getActiveCoupons;
//# sourceMappingURL=coupon.controllers.js.map