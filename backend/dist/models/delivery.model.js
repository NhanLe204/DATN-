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
const mongoose_1 = __importStar(require("mongoose"));
const delivery_enum_js_1 = require("../enums/delivery.enum.js");
const deliverySchema = new mongoose_1.Schema({
    delivery_name: { type: String, required: true },
    description: { type: String, default: '' },
    delivery_fee: { type: Number, required: true, default: 0 },
    estimated_delivery_time: { type: Date }, // Corrected typo here
    status: { type: String, enum: delivery_enum_js_1.DeliveryStatus, default: delivery_enum_js_1.DeliveryStatus.PENDING }
}, { timestamps: true });
const deliveryModel = mongoose_1.default.models.delivery || (0, mongoose_1.model)('delivery', deliverySchema);
exports.default = deliveryModel;
//# sourceMappingURL=delivery.model.js.map