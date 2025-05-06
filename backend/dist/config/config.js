"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ENV_VARS = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    FE_URL: process.env.FE_URL,
    FE_URL_PRODUCTION: process.env.FE_URL_PRODUCTION,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    VNP_TMNCODE: process.env.VNP_TMNCODE,
    VNP_HASHSECRET: process.env.VNP_HASHSECRET,
    VNP_URL: process.env.VNP_HASHSECRET,
    HOTLINE: process.env.HOTLINE,
    ADDRESS: process.env.ADDRESS
};
exports.default = ENV_VARS;
//# sourceMappingURL=config.js.map