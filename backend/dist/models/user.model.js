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
const user_enum_js_1 = require("../enums/user.enum.js");
const product_model_js_1 = __importDefault(require("./product.model.js"));
const addressSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isDefault: { type: Boolean, required: false }
});
const userSchema = new mongoose_1.Schema({
    googleId: {
        type: String,
        require: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        default: ''
    },
    fullname: {
        type: String,
        required: false,
        default: ''
    },
    password: {
        type: String,
        required: false
    },
    phone_number: {
        type: String,
        default: ''
    },
    address: {
        type: [addressSchema],
        default: []
    },
    status: {
        type: String,
        default: user_enum_js_1.UserStatus.PENDING
    },
    role: {
        type: String,
        default: user_enum_js_1.UserRoles.USER
    },
    avatar: {
        type: String
    },
    cart: {
        type: [
            {
                product: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: product_model_js_1.default,
                    required: true
                },
                quantity: { type: Number, default: 1 }
            }
        ],
        default: []
    },
    reset_password_token: {
        type: String,
        default: ''
    },
    reset_password_expires: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
// Đảm bảo chỉ một địa chỉ được đặt làm mặc định
// userSchema.pre('save', function (next) {
//   const user = this;
//   if (user.address) {
//     const defaultAddresses = user.address.filter((addr) => addr.isDefault);
//     if (defaultAddresses.length > 1) {
//       user.address.forEach((addr, index) => {
//         addr.isDefault = index === user.address.length - 1 && defaultAddresses.includes(addr);
//       });
//     }
//   }
//   next();
// });
const userModel = mongoose_1.default.models.user || (0, mongoose_1.model)('user', userSchema);
exports.default = userModel;
//# sourceMappingURL=user.model.js.map