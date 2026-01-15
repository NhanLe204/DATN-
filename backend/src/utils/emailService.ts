import ServiceModel from '../models/service.model.js';
import sendEmail from './sendEmail.js';  // Import hàm chung của bạn

export const sendBookingCompletionEmail = async (
  orderDetail: { realPrice: any; serviceId: any; petName: any; petType: any; booking_date: any },
  order: { orderId?: any; orderCode: string },
  user: { email: any; name?: any }
) => {
  try {
    const { realPrice, serviceId, petName, petType, booking_date } = orderDetail;
    const { orderCode } = order;
    const { email, name } = user;

    if (!email || !orderCode || !serviceId) {
      throw new Error('Missing required fields for email');
    }

    const service = await ServiceModel
      .findById(serviceId)
      .select('service_name')
      .lean();

    const formattedBookingDate = booking_date
      ? new Intl.DateTimeFormat('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(booking_date))
      : 'N/A';

    const petTypeMap: { [key: string]: string } = {
      cat: 'Mèo',
      dog: 'Chó',
    };
    const petTypeInVietnamese = petTypeMap[petType?.toLowerCase()] || petType || 'N/A';

    const subject = `Dịch vụ đã hoàn thành - Mã đơn hàng: ${orderCode}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Xác nhận hoàn thành dịch vụ</h2>
        <p style="color: #555; line-height: 1.6;">Kính gửi <strong>${name || 'Khách hàng'}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">Dịch vụ cho thú cưng của bạn đã hoàn thành thành công. Chi tiết:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 30%;">Mã đơn hàng:</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${orderCode}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Dịch vụ:</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${service?.service_name || 'Không xác định'}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thời gian:</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${formattedBookingDate}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Thú cưng:</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${petName || 'N/A'} (${petTypeInVietnamese})</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Giá thực tế:</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${realPrice ? Number(realPrice).toLocaleString('vi-VN') + ' ₫' : 'N/A'}</td></tr>
        </table>
        <p style="color: #555; text-align: center; margin-top: 30px;">Cảm ơn bạn đã tin tưởng Pet Heaven!</p>
        <p style="color: #555; text-align: center;">Trân trọng,<br><strong>Đội ngũ Pet Heaven</strong></p>
      </div>
    `;

    await sendEmail(email, subject, 'Dịch vụ hoàn thành (text fallback)', html);

    // console.log(`Completion email sent to ${email} for order ${orderCode}`);
  } catch (error) {
    console.error('Error sending completion email:', error);
    throw new Error('Failed to send completion email');
  }
};