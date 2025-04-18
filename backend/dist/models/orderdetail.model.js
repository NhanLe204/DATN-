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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const order_model_js_1 = __importDefault(require("./order.model.js"));
const product_model_js_1 = __importDefault(require("./product.model.js"));
const service_model_js_1 = __importDefault(require("./service.model.js"));
const orderDetailSchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: order_model_js_1.default, required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: product_model_js_1.default, required: false, default: '' },
    serviceId: { type: mongoose_1.Schema.Types.ObjectId, ref: service_model_js_1.default, required: false, default: '' },
    quantity: { type: Number, required: true },
    product_price: { type: Number, required: true },
    total_price: { type: Number, required: true },
    booking_date: { type: String, required: false, default: '' },
    petName: { type: String, required: false, default: '' },
    petType: {
        type: String,
        required: false,
        default: ''
    },
    isRated: { type: Boolean, default: false },
}, { timestamps: true });
const orderDetailModel = mongoose_1.default.models.orderDetail || (0, mongoose_1.model)('orderDetail', orderDetailSchema);
exports.default = orderDetailModel;
//# sourceMappingURL=orderdetail.model.js.map