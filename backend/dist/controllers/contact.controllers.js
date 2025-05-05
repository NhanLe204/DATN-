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
exports.submitContactForm = void 0;
const nodemailer = __importStar(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        console.log(email, 'email');
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
            to: 'ngocthanhnt04@gmail.com', // Email nhận thông tin
            subject: 'Liên hệ mới từ website',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Liên hệ mới từ website</h2>
          <p style="color: #555; line-height: 1.6;">Bạn đã nhận được một tin nhắn liên hệ mới với thông tin chi tiết như sau:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 30%;">Họ và tên:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Số điện thoại:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Tin nhắn:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${message}</td>
            </tr>
          </table>
          <p style="color: #555; text-align: center;">Vui lòng liên hệ lại với khách hàng sớm nhất có thể!</p>
        </div>
      `
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