"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_js_1 = __importDefault(require("./sendEmail.js"));
const service_model_js_1 = __importDefault(require("../models/service.model.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const order_model_js_1 = __importDefault(require("../models/order.model.js"));
const config_js_1 = __importDefault(require("../config/config.js"));
const sendBookingEmail = async ({ recipientEmail, customerName, orderDetails, orderId, isCancellation = false, subject: customSubject, html: customHtml }) => {
    console.log('Input data:', { recipientEmail, customerName, orderDetails, orderId, isCancellation });
    let finalOrderId = orderId;
    let finalCustomerName = customerName || 'Khách hàng';
    try {
        const order = await order_model_js_1.default.findById(orderId);
        if (order) {
            finalOrderId = order._id.toString();
            const user = await user_model_js_1.default.findById(order.userID).select('fullname');
            if (user && user.fullname) {
                finalCustomerName = user.fullname;
            }
            else {
                finalCustomerName = order.fullname || order.infoUserGuest?.fullName || 'Khách hàng';
                console.log(`No fullname found for userID: ${order.userID}`);
            }
        }
        else {
            throw new Error(`Order with ID ${orderId} not found`);
        }
    }
    catch (error) {
        console.error(`Error fetching order for orderId ${orderId}:`, error);
        throw error;
    }
    const servicePromises = orderDetails.map(async (detail) => {
        let serviceName = 'Không xác định';
        let servicePrice = 'Chờ xác nhận';
        let duration = 'Không xác định';
        try {
            if (detail.serviceId) {
                const service = await service_model_js_1.default.findById(detail.serviceId).select('service_name service_price duration');
                if (service) {
                    serviceName = service.service_name;
                    servicePrice = service.service_price;
                    duration = service.duration;
                }
            }
        }
        catch (error) {
            console.error(`Error fetching service for serviceId ${detail.serviceId}:`, error);
        }
        return {
            ...detail,
            service_name: serviceName,
            service_price: servicePrice,
            duration: duration,
            customerName: finalCustomerName
        };
    });
    const enrichedOrderDetails = await Promise.all(servicePromises);
    const formatDateTime = (date) => {
        if (!date)
            return 'Không xác định';
        return new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        }).format(date);
    };
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        }
        return price;
    };
    console.log('Final data:', { finalCustomerName, finalOrderId });
    const subject = customSubject || (isCancellation ? 'Thông báo hủy lịch đặt dịch vụ' : 'Xác nhận đặt lịch thành công');
    const text = `Kính gửi ${finalCustomerName},

${isCancellation ? 'Lịch đặt dịch vụ của bạn đã được hủy thành công' : 'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn'}:

${enrichedOrderDetails
        .map((detail) => `- Dịch vụ: ${detail.service_name}\n- Thời gian: ${formatDateTime(detail.booking_date)}\n- Thú cưng: ${detail.petName || 'N/A'} (${detail.petType || 'N/A'})\n- Thời gian dự tính: ${detail.duration} phút`)
        .join('\n\n')}
- Địa điểm: ${config_js_1.default.ADDRESS}
- Mã đặt lịch: ${finalOrderId}

Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua số ${config_js_1.default.HOTLINE} hoặc email ${config_js_1.default.EMAIL_USER}.

Trân trọng,
Pet Heaven
Hotline: ${config_js_1.default.HOTLINE}
Email: ${config_js_1.default.EMAIL_USER}`;
    const html = customHtml ||
        `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">${isCancellation ? 'Thông báo hủy lịch đặt dịch vụ' : 'Xác nhận đặt lịch thành công'}</h2>
      <p style="color: #555; line-height: 1.6;">Kính gửi <strong>${finalCustomerName}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">
        ${isCancellation ? 'Lịch đặt dịch vụ của bạn đã được hủy thành công.' : 'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn:'}
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${enrichedOrderDetails
            .map((detail) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 30%;">Dịch vụ:</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${detail.service_name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thời gian:</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatDateTime(detail.booking_date)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thú cưng:</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${detail.petName || 'N/A'} (${detail.petType || 'N/A'})</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thời gian dự kiến:</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${detail.duration} phút</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Giá dịch vụ:</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;"> Giá sẽ được tính tại shop dựa vào khối lượng của pet</td>
              </tr>
            `)
            .join('')}
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Địa điểm:</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${config_js_1.default.ADDRESS}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Mã đặt lịch:</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${finalOrderId}</td>
        </tr>
      </table>
      <p style="color: #555; line-height: 1.6;">
        Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline <strong>${config_js_1.default.HOTLINE}</strong> hoặc email <strong>${config_js_1.default.EMAIL_USER}</strong>.
      </p>
      <p style="color: #555; text-align: center;">Trân trọng,<br><strong>Pet Heaven</strong></p>
    </div>
  `;
    try {
        await (0, sendEmail_js_1.default)(recipientEmail, subject, text, html);
        console.log(`${isCancellation ? 'Cancellation' : 'Booking'} email sent to:`, recipientEmail);
    }
    catch (error) {
        console.error(`Error sending ${isCancellation ? 'cancellation' : 'booking'} email:`, error);
        throw error;
    }
};
exports.default = sendBookingEmail;
//# sourceMappingURL=sendBookingEmail.js.map