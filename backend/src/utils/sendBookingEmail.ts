import sendEmail from './sendEmail.js';
import ServiceModel from '@/models/service.model.js';
import userModel from '@/models/user.model.js';
import orderModel from '@/models/order.model.js';

interface BookingEmailData {
    recipientEmail: string;
    customerName?: string;
    orderDetails: Array<{
        serviceId: string | null;
        booking_date: Date | null;
        petName: string | null;
        petType: string | null;
    }>;
    orderId: string; // Bắt buộc để lấy từ orderModel
}

const sendBookingEmail = async ({ recipientEmail, customerName, orderDetails, orderId }: BookingEmailData): Promise<void> => {
    console.log('Input data:', { recipientEmail, customerName, orderDetails, orderId });

    let finalOrderId = orderId;
    let finalCustomerName = customerName || 'Khách hàng';

    // Lấy thông tin từ orderModel
    try {
        const order = await orderModel.findById(orderId);
        if (order) {
            finalOrderId = order._id.toString();
            const user = await userModel.findById(order.userID).select('fullname');
            if (user && user.fullname) {
                finalCustomerName = user.fullname;
            } else {
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
                const service = await ServiceModel.findById(detail.serviceId)
                    .select('service_name service_price duration');
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

    const subject = 'Xác nhận đặt lịch thành công';
    const text = `Kính gửi ${finalCustomerName},

Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn:

${enrichedOrderDetails
            .map(
                (detail) =>
                    `- Dịch vụ: ${detail.service_name}\n- Thời gian: ${formatDateTime(detail.booking_date)}\n- Thú cưng: ${detail.petName} (${detail.petType})\n- Giá dự tính: ${formatPrice(detail.service_price)}\n- Thời gian dự tính: ${detail.duration} phút`
            )
            .join('\n\n')}
- Địa điểm: Pet Heaven, 123 Đường Thú Cưng, TP. HCM
- Mã đặt lịch: ${finalOrderId}

Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng liên hệ với chúng tôi qua số 0888-666-333 hoặc email ngocthanhnt04@gmail.com.

Trân trọng,
Pet Heaven
Hotline: 0888-666-333
Email: ngocthanhnt04@gmail.com`;

    const html = `
    <p>Kính gửi <strong>${finalCustomerName}</strong>,</p>
    <p>Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn:</p>
    <ul>
      ${enrichedOrderDetails
            .map(
                (detail) => `
            <li>
              <strong>Dịch vụ:</strong> ${detail.service_name}<br>
              <strong>Thời gian:</strong> ${formatDateTime(detail.booking_date)}<br>
              <strong>Thú cưng:</strong> ${detail.petName} <strong>Loại:</strong> (${detail.petType})<br>
              <strong>Giá dự tính:</strong> ${formatPrice(detail.service_price)}<br>
              <strong>Thời gian dự tính:</strong> ${detail.duration} phút
            </li>
          `
            )
            .join('')}
    </ul>
    <p>
      <strong>Địa điểm:</strong> Pet Heaven, 123 Đường Thú Cưng, TP. HCM<br>
      <strong>Mã đặt lịch:</strong> ${finalOrderId}
    </p>
    <p>Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng liên hệ với chúng tôi sớm 12 tiếng trước lịch hẹn của quý khách.</p>
    <p>Trân trọng,<br><strong>Pet Heaven</strong><br>Hotline: 0888-666-333<br>Email: ngocthanhnt04@gmail.com</p>
  `;

    try {
        await sendEmail(recipientEmail, subject, text, html);
        console.log('Booking email sent to:', recipientEmail);
    } catch (error) {
        console.error('Error sending booking email:', error);
        throw error;
    }
};

export default sendBookingEmail;