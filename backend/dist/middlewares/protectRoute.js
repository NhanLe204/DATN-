"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.protectRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = __importDefault(require("../config/config.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const user_enum_js_1 = require("../enums/user.enum.js");
const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        console.log('Token:', token);
        if (!token) {
            res.status(401).json({ message: 'You are not authorized to access this route' });
            return;
        }
        if (!config_js_1.default.JWT_SECRET) {
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_js_1.default.JWT_SECRET);
        if (!decoded) {
            res.status(401).json({ message: 'You are not authorized to access this route' });
            return;
        }
        const user = await user_model_js_1.default.findById(decoded.userId).select('-password');
        console.log('User:', user);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.error('Error in protectRoute middleware:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.protectRoute = protectRoute;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Bạn chưa đăng nhập' });
        return;
    }
    if (req.user.role !== user_enum_js_1.UserRoles.ADMIN) {
        res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=protectRoute.js.map