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
const service_enum_js_1 = require("../enums/service.enum.js");
const serviceSchema = new mongoose_1.Schema({
    service_name: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    service_price: { type: Number, required: true, default: 0 },
    duration: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: Object.values(service_enum_js_1.ServiceStatus).filter((value) => typeof value === 'string'), // Lấy các giá trị của enum
        default: service_enum_js_1.ServiceStatus.ACTIVE // Dùng giá trị từ enum
    }
}, { timestamps: true });
const ServiceModel = mongoose_1.default.models.Service || (0, mongoose_1.model)('Service', serviceSchema);
exports.default = ServiceModel;
//# sourceMappingURL=service.model.js.map