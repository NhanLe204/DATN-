"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const coupon_enum_js_1 = require("../enums/coupon.enum.js");
const mongoose_1 = __importStar(require("mongoose"));
// Định nghĩa schema cho Coupon
const couponSchema = new mongoose_1.Schema({
    coupon_code: {
        type: String,
        required: [true, 'Mã coupon là bắt buộc'],
        unique: true, // Đảm bảo mã coupon là duy nhất
        trim: true, // Loại bỏ khoảng trắng thừa
        uppercase: true
    },
    discount_value: {
        type: Number,
        required: [true, 'Giá trị giảm giá là bắt buộc'],
        min: [0, 'Giá trị giảm giá không được âm']
    },
    min_order_value: {
        type: Number,
        required: [true, 'Giá trị đơn hàng tối thiểu là bắt buộc'],
        min: [0, 'Giá trị đơn hàng tối thiểu không được âm']
    },
    max_discount: {
        type: Number,
        required: [true, 'Giá trị giảm giá tối đa là bắt buộc'],
        min: [0, 'Giá trị giảm giá tối đa không được âm']
    },
    start_date: {
        type: Date,
        required: [true, 'Ngày bắt đầu là bắt buộc']
    },
    end_date: {
        type: Date,
        required: true
    },
    usage_limit: {
        type: Number,
        required: [true, 'Số lần sử dụng tối đa là bắt buộc'],
        min: [1, 'Số lần sử dụng tối đa phải lớn hơn 0']
    },
    used_count: {
        type: Number,
        default: 0, // Mặc định là 0 khi tạo coupon mới
        min: [0, 'Số lần đã sử dụng không được âm']
    },
    status: {
        type: String,
        enum: coupon_enum_js_1.CouponStatus,
        default: coupon_enum_js_1.CouponStatus.ACTIVE
    }
});
const couponModel = mongoose_1.default.models.coupon || (0, mongoose_1.model)('coupon', couponSchema);
exports.default = couponModel;
//# sourceMappingURL=coupon.model.js.map