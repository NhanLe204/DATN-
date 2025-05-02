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
exports.submitContactForm = void 0;
const nodemailer = __importStar(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !phone || !message) {
            res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
        }
        // Cấu hình transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        // Nội dung email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'hoangthaithuan07@gmail.com', // Email nhận thông tin
            subject: 'Liên hệ mới từ website',
            text: `Bạn có một liên hệ mới từ website:\n\nTên: ${name}\nEmail: ${email}\nSĐT: ${phone}\nTin nhắn:\n${message}`
        };
        // Gửi email
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'Thông tin đã được gửi thành công qua email!'
        });
    }
    catch (error) {
        console.error('Lỗi khi gửi email:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại!'
        });
    }
};
exports.submitContactForm = submitContactForm;
//# sourceMappingURL=contact.controllers.js.map