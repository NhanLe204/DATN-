import sendEmail from './sendEmail.js';
import ServiceModel from '../models/service.model.js';
import userModel from '../models/user.model.js';
import orderModel from '../models/order.model.js';
import ENV_VARS from '../config/config.js';

interface BookingEmailData {
  recipientEmail: string;
  customerName?: string;
  orderDetails: Array<{
    serviceId: string | null;
    booking_date: Date | null;
    petName: string | null;
    petType: string | null;
  }>;
  orderId: string;
  isCancellation?: boolean;
}

const sendBookingEmail = async ({
  recipientEmail,
  customerName,
  orderDetails,
  orderId,
  isCancellation = false,
  subject: customSubject,
  html: customHtml,
}: BookingEmailData & { subject?: string; html?: string }): Promise<void> => {
  console.log('Input data:', { recipientEmail, customerName, orderDetails, orderId, isCancellation });

  let finalOrderId = orderId;
  let finalCustomerName = customerName || 'Khách hàng';

  try {
    const order = await orderModel.findById(orderId);
    if (order) {
      finalOrderId = order._id.toString();
      const user = await userModel.findById(order.userID).select('fullname');
      if (user && user.fullname) {
        finalCustomerName = user.fullname;
      } else {
        finalCustomerName = order.fullname || order.infoUserGuest?.fullName || 'Khách hàng';
        console.log(`No fullname found for userID: ${order.userID}`);
      }
    } else {
      throw new Error(`Order with ID ${orderId} not found`);
    }
  } catch (error) {
    console.error(`Error fetching order for orderId ${orderId}:`, error);
    throw error;
  }

  const servicePromises = orderDetails.map(async (detail) => {
    let serviceName = 'Không xác định';
    let servicePrice: number | string = 'Không xác định';
    let duration: number | string = 'Không xác định';

    try {
      if (detail.serviceId) {
        const service = await ServiceModel.findById(detail.serviceId).select('service_name service_price duration');
        if (service) {
          serviceName = service.service_name;
          servicePrice = service.service_price;
          duration = service.duration;
        }
      }
    } catch (error) {
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

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Không xác định';
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

  const formatPrice = (price: number | string) => {
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
  .map(
    (detail) =>
      `- Dịch vụ: ${detail.service_name}\n- Thời gian: ${formatDateTime(detail.booking_date)}\n- Thú cưng: ${detail.petName || 'N/A'} (${detail.petType || 'N/A'})\n- Thời gian dự tính: ${detail.duration} phút`
  )
  .join('\n\n')}
- Địa điểm: ${ENV_VARS.ADDRESS}
- Mã đặt lịch: ${finalOrderId}

Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua số ${ENV_VARS.HOTLINE} hoặc email ${ENV_VARS.EMAIL_USER}.

Trân trọng,
Pet Heaven
Hotline: ${ENV_VARS.HOTLINE}
Email: ${ENV_VARS.EMAIL_USER}`;

  const html = customHtml || `
    <p>Kính gửi <strong>${finalCustomerName}</strong>,</p>
    <p>${isCancellation ? 'Lịch đặt dịch vụ của bạn đã được hủy thành công' : 'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn'}:</p>
    <ul>
      ${enrichedOrderDetails
        .map(
          (detail) => `
            <li>
              <strong>Dịch vụ:</strong> ${detail.service_name}<br>
              <strong>Thời gian:</strong> ${formatDateTime(detail.booking_date)}<br>
              <strong>Thú cưng:</strong> ${detail.petName || 'N/A'} (${detail.petType || 'N/A'})<br>
              <strong>Thời gian dự kiến:</strong> ${detail.duration} phút
            </li>
          `
        )
        .join('')}
    </ul>
    <p>
      <strong>Địa điểm:</strong> ${ENV_VARS.ADDRESS}<br>
      <strong>Mã đặt lịch:</strong> ${finalOrderId}
    </p>
    <p>Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline <strong>${ENV_VARS.HOTLINE}</strong> hoặc email <strong>${ENV_VARS.EMAIL_USER}</strong>.</p>
    <p>Trân trọng,<br><strong>Pet Heaven</strong></p>
  `;

  try {
    await sendEmail(recipientEmail, subject, text, html);
    console.log(`${isCancellation ? 'Cancellation' : 'Booking'} email sent to:`, recipientEmail);
  } catch (error) {
    console.error(`Error sending ${isCancellation ? 'cancellation' : 'booking'} email:`, error);
    throw error;
  }
};

export default sendBookingEmail;