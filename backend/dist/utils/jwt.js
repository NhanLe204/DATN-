"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = __importDefault(require("../config/config.js"));
const generateAccessToken = async (userId, res) => {
    if (!config_js_1.default.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jsonwebtoken_1.default.sign({ userId }, config_js_1.default.JWT_SECRET, {
        expiresIn: '15s'
    });
    return token;
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (userId, res) => {
    if (!config_js_1.default.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, config_js_1.default.JWT_SECRET, {
        expiresIn: '7d'
    });
    return refreshToken;
};
exports.generateRefreshToken = generateRefreshToken;
//# sourceMappingURL=jwt.js.map