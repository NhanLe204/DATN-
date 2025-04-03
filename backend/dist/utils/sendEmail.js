"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_js_1 = __importDefault(require("../config/config.js"));
const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: config_js_1.default.EMAIL_USER,
                pass: config_js_1.default.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: `Your App <${config_js_1.default.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};
exports.default = sendEmail;
//# sourceMappingURL=sendEmail.js.map