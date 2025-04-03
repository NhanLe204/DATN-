"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = __importDefault(require("../config/config.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader ? authHeader.split(' ')[1] : '';
        if (!config_js_1.default.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
        if (!config_js_1.default.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        const user = await user_model_js_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.error('Error in verifyToken middleware:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=verifyToken.js.map