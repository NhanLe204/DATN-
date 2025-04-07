"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_js_1 = __importDefault(require("./sendEmail.js"));
const service_model_js_1 = __importDefault(require("@/models/service.model.js"));
const user_model_js_1 = __importDefault(require("@/models/user.model.js"));
const order_model_js_1 = __importDefault(require("@/models/order.model.js"));
const config_js_1 = __importDefault(require("../config/config.js"));
const sendBookingEmail = async ({ recipientEmail, customerName, orderDetails, orderId, isCancellation = false, }) => {
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
                finalCustomerName = order.fullname || 'Khách hàng';
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
        let servicePrice = 'Không xác định';
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
            customerName: finalCustomerName,
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
            timeZone: 'Asia/Ho_Chi_Minh',
        }).format(date);
    };
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        }
        return price;
    };
    console.log('Final data:', { finalCustomerName, finalOrderId });
    const subject = isCancellation ? 'Thông báo hủy lịch đặt dịch vụ' : 'Xác nhận đặt lịch thành công';
    const text = `Kính gửi ${finalCustomerName},

${isCancellation ? 'Lịch đặt dịch vụ của bạn đã được hủy thành công' : 'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn'}:

${enrichedOrderDetails
        .map((detail) => `- Dịch vụ: ${detail.service_name}\n- Thời gian: ${formatDateTime(detail.booking_date)}\n- Thú cưng: ${detail.petName} (${detail.petType})\n- Giá dự tính: ${formatPrice(detail.service_price)}\n- Thời gian dự tính: ${detail.duration} phút`)
        .join('\n\n')}
- Địa điểm: ${config_js_1.default.ADDRESS}
- Mã đặt lịch: ${finalOrderId}

Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua số 0888-666-333 hoặc email ${config_js_1.default.EMAIL_USER}.

Trân trọng,
Pet Heaven
Hotline: ${config_js_1.default.HOTLINE}
Email: ${config_js_1.default.EMAIL_USER}`;
    const html = `
    <p>Kính gửi <strong>${finalCustomerName}</strong>,</p>
    <p>${isCancellation ? 'Lịch đặt dịch vụ của bạn đã được hủy thành công' : 'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn'}:</p>
    <ul>
      ${enrichedOrderDetails
        .map((detail) => `
            <li>
              <strong>Dịch vụ:</strong> ${detail.service_name}<br>
              <strong>Thời gian:</strong> ${formatDateTime(detail.booking_date)}<br>
              <strong>Thú cưng:</strong> ${detail.petName} (${detail.petType})<br>
              <strong>Giá dự tính:</strong> ${formatPrice(detail.service_price)}<br>
              <strong>Thời gian dự kiến:</strong> ${detail.duration} phút
            </li>
          `)
        .join('')}
    </ul>
    <p>
      <strong>Địa điểm:</strong> ${config_js_1.default.ADDRESS}<br>
      <strong>Mã đặt lịch:</strong> ${finalOrderId}
    </p>
    <p>Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline <strong>${config_js_1.default.HOTLINE}</strong> hoặc email <strong>${config_js_1.default.EMAIL_USER}</strong>.</p>
    <p>Trân trọng,<br><strong>Pet Heaven</strong></p>
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