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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const order_enum_js_1 = require("../enums/order.enum.js");
const paymentType_model_js_1 = __importDefault(require("../models/paymentType.model.js"));
const delivery_model_js_1 = __importDefault(require("./delivery.model.js"));
const coupon_model_js_1 = __importDefault(require("../models/coupon.model.js"));
const booking_enum_js_1 = require("../enums/booking.enum.js");
const orderSchema = new mongoose_1.Schema({
    userID: { type: mongoose_1.Schema.Types.ObjectId, ref: user_model_js_1.default, required: false },
    fullname: { type: String, required: false },
    phone: { type: String, required: false },
    paymentOrderCode: { type: Number, required: false },
    payment_typeID: { type: mongoose_1.Schema.Types.ObjectId, ref: paymentType_model_js_1.default, default: null },
    deliveryID: { type: mongoose_1.Schema.Types.ObjectId, ref: delivery_model_js_1.default, default: null },
    couponID: { type: mongoose_1.Schema.Types.ObjectId, ref: coupon_model_js_1.default, default: null },
    order_date: { type: Date, default: Date.now },
    total_price: { type: Number, required: true },
    shipping_address: { type: String, required: false },
    payment_status: {
        type: String,
        enum: order_enum_js_1.PaymentStatus,
        default: order_enum_js_1.PaymentStatus.PENDING,
        required: false
    },
    status: {
        type: String,
        enum: [...Object.values(order_enum_js_1.OrderStatus), null],
        default: null
    },
    bookingStatus: {
        type: String,
        enum: [...Object.values(booking_enum_js_1.BookingStatus), null],
        default: null
    }
}, { timestamps: true });
const orderModel = mongoose_1.default.models.Order || (0, mongoose_1.model)('Order', orderSchema);
exports.default = orderModel;
//# sourceMappingURL=order.model.js.map