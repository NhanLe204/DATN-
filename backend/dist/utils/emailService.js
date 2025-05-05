"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingCompletionEmail = void 0;
const service_model_1 = __importDefault(require("../models/service.model"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Kiểm tra kết nối SMTP khi khởi động
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    }
    else {
        console.log('SMTP connection is ready');
    }
});
const sendBookingCompletionEmail = async (orderDetail, order, user) => {
    try {
        const { realPrice, serviceId, petName, petType, booking_date } = orderDetail;
        const { orderId } = order;
        const { email, name } = user;
        if (!email || !orderId || !serviceId) {
            throw new Error('Missing required fields for email');
        }
        const service = await service_model_1.default.findById(serviceId).select('service_name');
        const formattedBookingDate = booking_date
            ? new Intl.DateTimeFormat('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                dateStyle: 'short',
                timeStyle: 'short'
            }).format(booking_date)
            : 'N/A';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Dịch vụ của bạn đã hoàn thành - Mã đơn hàng: ${orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Xác nhận hoàn thành dịch vụ</h2>
          <p style="color: #555; line-height: 1.6;">Kính gửi <strong>${name || 'Khách hàng'}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">Chúng tôi xin thông báo rằng dịch vụ của bạn đã được hoàn thành thành công. Dưới đây là thông tin chi tiết:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 30%;">Mã đơn hàng:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Dịch vụ:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${service?.service_name || 'Không xác định'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thời gian:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${formattedBookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thú cưng:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${petName || 'N/A'} (${petType || 'N/A'})</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Giá thực tế:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${realPrice ? realPrice.toLocaleString('vi-VN') + ' VND' : 'N/A'}</td>
            </tr>
          </table>
          <p style="color: #555; text-align: center;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
          <p style="color: #555; text-align: center;">Trân trọng,<br><strong>Pet Heaven</strong></p>
        </div>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Completion email sent to ${email} for order ${orderId}`);
    }
    catch (error) {
        console.error('Error sending completion email:', error);
        throw new Error('Failed to send completion email');
    }
};
exports.sendBookingCompletionEmail = sendBookingCompletionEmail;
//# sourceMappingURL=emailService.js.map