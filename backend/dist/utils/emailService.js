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
        <p>Kính gửi <strong>${name || 'Khách hàng'}</strong>,</p>
        <p>Chúng tôi xin thông báo rằng dịch vụ của bạn đã được hoàn thành thành công!</p>
        <ul>
          <li><strong>Mã đơn hàng:</strong> ${orderId}</li>
          <li><strong>Dịch vụ:</strong> ${service?.service_name || 'Không xác định'}</li>
          <li><strong>Thời gian:</strong> ${formattedBookingDate}</li>
          <li><strong>Thú cưng:</strong> ${petName || 'N/A'} (${petType || 'N/A'})</li>
          <li><strong>Giá thực tế:</strong> ${realPrice ? realPrice.toLocaleString('vi-VN') + ' VND' : 'N/A'}</li>
        </ul>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        <p>Trân trọng,<br><strong>Pet Heaven</strong></p>
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