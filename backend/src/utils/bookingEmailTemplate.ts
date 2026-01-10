import ENV_VARS from '../config/config.js';

interface Detail {
  service_name: string;
  booking_date: Date | null;
  petName: string | null;
  petType: string | null;
  duration: number | string;
}

export const generateBookingEmailHtml = (
  customerName: string,
  details: Detail[],
  orderCode: string,
  isCancellation: boolean = false
): string => {
  const formatDateTime = (date: Date | null): string => {
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

  const title = isCancellation 
    ? 'Thông báo hủy lịch đặt dịch vụ' 
    : 'Xác nhận đặt lịch thành công';

  const greeting = isCancellation
    ? 'Lịch đặt dịch vụ của bạn đã được hủy thành công.'
    : 'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn:';

  // Viết HTML theo kiểu return() – indent đẹp như JSX, dễ sửa vl
  return (
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 12px;">
      <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <h2 style="color: #22A6DF; text-align: center; font-size: 28px; margin-bottom: 32px;">
          ${title}
        </h2>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Kính gửi <strong>${customerName}</strong>,
        </p>

        <p style="font-size: 16px; color: #555; line-height: 1.8; margin: 20px 0;">
          ${greeting}
        </p>

        ${details.map(detail => (
          `<div style="background: #f0f8ff; border-left: 4px solid #22A6DF; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 15px;">
              <strong>Dịch vụ:</strong> ${detail.service_name}
            </p>
            <p style="margin: 8px 0; font-size: 15px;">
              <strong>Thời gian:</strong> ${formatDateTime(detail.booking_date)}
            </p>
            <p style="margin: 8px 0; font-size: 15px;">
              <strong>Thú cưng:</strong> ${detail.petName || 'N/A'} (${detail.petType || 'N/A'})
            </p>
            <p style="margin: 8px 0; font-size: 15px;">
              <strong>Thời gian dự kiến:</strong> ${detail.duration} phút
            </p>
            <p style="margin: 8px 0; font-size: 15px; color: #d4380d;">
              <strong>Giá dịch vụ:</strong> Giá sẽ được tính tại shop dựa vào khối lượng của pet
            </p>
          </div>`
        )).join('')}

        <div style="background: #e6f7ff; border-radius: 8px; padding: 20px; margin: 32px 0; text-align: center;">
          <p style="margin: 8px 0; font-size: 16px;">
            <strong>Địa điểm:</strong> ${ENV_VARS.ADDRESS}
          </p>
          <p style="margin: 16px 0; font-size: 20px; color: #22A6DF;">
            <strong>Mã đặt lịch: ${orderCode}</strong>
          </p>
        </div>

        <p style="font-size: 15px; color: #666; line-height: 1.8; text-align: center; margin-top: 40px;">
          Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ qua hotline 
          <strong>${ENV_VARS.HOTLINE}</strong> hoặc email 
          <strong>${ENV_VARS.EMAIL_USER}</strong>.
        </p>

        <p style="text-align: center; margin-top: 40px; font-size: 18px; color: #333;">
          Trân trọng,<br>
          <strong style="color: #22A6DF; font-size: 22px;">Pet Heaven</strong>
        </p>
      </div>
    </div>`
  );
};