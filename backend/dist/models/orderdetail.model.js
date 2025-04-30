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
const order_model_js_1 = __importDefault(require("./order.model.js"));
const product_model_js_1 = __importDefault(require("./product.model.js"));
const service_model_js_1 = __importDefault(require("./service.model.js"));
const orderDetailSchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: order_model_js_1.default, required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: product_model_js_1.default, required: false, default: '' },
    serviceId: { type: mongoose_1.Schema.Types.ObjectId, ref: service_model_js_1.default, required: false, default: '' },
    quantity: { type: Number, required: true },
    product_price: { type: Number, required: false },
    total_price: { type: Number, required: false },
    booking_date: { type: Date, required: false, default: '' },
    petName: { type: String, required: false, default: '' },
    petType: {
        type: String,
        required: false,
        default: ''
    },
    isRated: { type: Boolean, default: false },
    petWeight: { type: Number, require: false, default: '' },
    realPrice: { type: Number, require: false, default: '' },
}, { timestamps: true });
const orderDetailModel = mongoose_1.default.models.orderDetail || (0, mongoose_1.model)('orderDetail', orderDetailSchema);
exports.default = orderDetailModel;
//# sourceMappingURL=orderdetail.model.js.map