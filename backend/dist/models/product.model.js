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
const category_model_js_1 = __importDefault(require("./category.model.js"));
const product_enum_js_1 = require("../enums/product.enum.js");
const brand_model_js_1 = __importDefault(require("./brand.model.js"));
const tag_model_js_1 = __importDefault(require("./tag.model.js"));
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: category_model_js_1.default,
        autoPopulate: true,
        required: [true, 'category_id is required']
    },
    image_url: {
        type: [String],
        default: []
    },
    brand_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: brand_model_js_1.default,
        autoPopulate: true,
        required: [true, 'brand_id is required']
    },
    tag_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: tag_model_js_1.default,
        autoPopulate: true
    },
    status: {
        type: String,
        enum: product_enum_js_1.ProductStatus,
        default: product_enum_js_1.ProductStatus.AVAILABLE
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    quantity_sold: {
        type: Number,
        min: 0,
        default: 0
    },
    quantity: {
        type: Number,
        min: 0,
        default: 0
    }
}, { timestamps: true });
const productModel = mongoose_1.default.models.product || (0, mongoose_1.model)('product', productSchema);
exports.default = productModel;
//# sourceMappingURL=product.model.js.map