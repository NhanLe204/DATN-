import sendEmail from './sendEmail.js';
import ServiceModel from '../models/service.model.js';
import userModel from '../models/user.model.js';
import orderModel from '../models/order.model.js';

import BookingEmailTemplate from './bookingEmailTemplate.js';
import { render } from '@react-email/render';

interface BookingEmailData {
  recipientEmail: string;
  customerName?: string;
  orderDetails: Array<{
    serviceId: string | null;
    booking_date: Date | null;
    petName: string | null;
    petType: string | null;
    realPrice?: number | null;
  }>;
  orderId: string;
  isCancellation?: boolean;
  isCompleted?: boolean;
}

const sendBookingEmail = async ({
  recipientEmail,
  customerName: inputCustomerName,
  orderDetails,
  orderId,
  isCancellation = false,
  isCompleted = false,
}: BookingEmailData): Promise<void> => {
  let displayOrderCode = orderId;
  let finalCustomerName = inputCustomerName || 'Khách hàng';

  try {
    const order = await orderModel
      .findById(orderId)
      .select('orderCode userID fullname inforUserGuest')
      .lean();

    if (order) {
      displayOrderCode = order.orderCode || orderId;

      if (!inputCustomerName) {
        finalCustomerName = order.userID
          ? (
              await userModel
                .findById(order.userID)
                .select('fullname')
                .lean()
            )?.fullname ||
            order.fullname ||
            order.inforUserGuest?.fullName ||
            'Khách hàng'
          : order.fullname ||
            order.inforUserGuest?.fullName ||
            'Khách hàng';
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đơn hàng qua email:');
  }

  const enrichedDetails = await Promise.all(
    orderDetails.map(async (detail) => {
      let serviceName = 'Không xác định';
      let duration: number | string = 'Không xác định';

      if (detail.serviceId) {
        const service = await ServiceModel
          .findById(detail.serviceId)
          .select('service_name duration')
          .lean();

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
        realPrice: detail.realPrice || null,
      };
    })
  );

  let subject = 'Xác nhận đặt lịch thành công';

  if (isCancellation) {
    subject = 'Thông báo hủy lịch đặt dịch vụ';
  }

  if (isCompleted) {
    subject = 'Thông báo hoàn thành dịch vụ';
  }

  const html = await render(
    BookingEmailTemplate({
      customerName: finalCustomerName,
      details: enrichedDetails,
      orderCode: displayOrderCode,
      isCancellation,
      isCompleted,
    })
  );

  const text =
    'Vui lòng xem email ở chế độ HTML để thấy nội dung chi tiết.';

  await sendEmail(
    recipientEmail,
    subject,
    text,
    html
  );
};

export default sendBookingEmail;