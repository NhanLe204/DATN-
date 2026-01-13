import sendEmail from './sendEmail.js';
import ServiceModel from '../models/service.model.js';
import userModel from '../models/user.model.js';
import orderModel from '../models/order.model.js';
import { generateBookingEmailHtml } from './bookingEmailTemplate.js';

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
  customerName: inputCustomerName,
  orderDetails,
  orderId,
  isCancellation = false,
}: BookingEmailData): Promise<void> => {
  let displayOrderCode = orderId;
  let finalCustomerName = inputCustomerName || 'Khách hàng';

  try {
    const order = await orderModel.findById(orderId).select('orderCode userID fullname inforUserGuest').lean();
    if (order) {
      displayOrderCode = order.orderCode || orderId;
      if (!inputCustomerName) {
        finalCustomerName = order.userID
          ? (await userModel.findById(order.userID).select('fullname').lean())?.fullname || order.fullname || order.inforUserGuest?.fullName || 'Khách hàng'
          : order.fullname || order.inforUserGuest?.fullName || 'Khách hàng';
      }
    }
  } catch (error) {
    console.error('Error fetching order for email:', error);
  }

  const enrichedDetails = await Promise.all(
    orderDetails.map(async (detail) => {
      let serviceName = 'Không xác định';
      let duration: number | string = 'Không xác định';

      if (detail.serviceId) {
        const service = await ServiceModel.findById(detail.serviceId).select('service_name duration').lean();
        if (service) {
          serviceName = service.service_name;
          duration = service.duration || duration;
        }
      }

      return {
        service_name: serviceName,
        booking_date: detail.booking_date,
        petName: detail.petName,
        petType: detail.petType,
        duration,
      };
    })
  );

  const subject = isCancellation ? 'Thông báo hủy lịch đặt dịch vụ' : 'Xác nhận đặt lịch thành công';
  const text = 'Vui lòng xem email ở chế độ HTML để thấy nội dung chi tiết.';

  const html = generateBookingEmailHtml(
    finalCustomerName,
    enrichedDetails,
    displayOrderCode,
    isCancellation
  );

  await sendEmail(recipientEmail, subject, text, html);
  // console.log(`Email ${isCancellation ? 'hủy' : 'xác nhận'} gửi thành công đến: ${recipientEmail}`);
};

export default sendBookingEmail;