import React from 'react';

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from '@react-email/components';
import ENV_VARS from '../config/config.js';

interface Detail {
  service_name: string;
  booking_date: Date | null;
  petName: string | null;
  petType: string | null;
  duration: number | string;
  realPrice?: number | null;
}

interface BookingEmailTemplateProps {
  customerName: string;
  details: Detail[];
  orderCode: string;
  isCancellation?: boolean;
  isCompleted?: boolean;
}

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

export default function BookingEmailTemplate({
  customerName,
  details,
  orderCode,
  isCancellation = false,
  isCompleted = false,
}: BookingEmailTemplateProps) {
  let title = 'Xác nhận đặt lịch thành công';
  let greeting =
    'Cảm ơn bạn đã đặt lịch với chúng tôi! Dưới đây là thông tin chi tiết về lịch hẹn của bạn:';

  if (isCancellation) {
    title = 'Thông báo hủy lịch đặt dịch vụ';
    greeting = 'Lịch đặt dịch vụ của bạn đã được hủy thành công.';
  }

  if (isCompleted) {
    title = 'Thông báo hoàn thành dịch vụ';
    greeting =
      'Dịch vụ của bạn đã được hoàn thành thành công. Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!';
  }

  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa',
          padding: '20px',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Heading
            style={{
              color: '#22A6DF',
              textAlign: 'center',
              fontSize: '28px',
              marginBottom: '32px',
            }}
          >
            {title}
          </Heading>

          <Text
            style={{
              fontSize: '16px',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            Kính gửi <strong>{customerName}</strong>,
          </Text>

          <Text
            style={{
              fontSize: '16px',
              color: '#555',
              lineHeight: '1.8',
              margin: '20px 0',
            }}
          >
            {greeting}
          </Text>

          {details.map((detail, index) => (
            <Section
              key={index}
              style={{
                backgroundColor: '#f0f8ff',
                borderLeft: '4px solid #22A6DF',
                borderRadius: '8px',
                padding: '20px',
                margin: '24px 0',
              }}
            >
              <Text>
                <strong>Dịch vụ:</strong> {detail.service_name}
              </Text>

              <Text>
                <strong>Thời gian:</strong>{' '}
                {formatDateTime(detail.booking_date)}
              </Text>

              <Text>
                <strong>Thú cưng:</strong> {detail.petName || 'N/A'} (
                {detail.petType || 'N/A'})
              </Text>

              <Text>
                <strong>Thời gian dự kiến:</strong> {detail.duration} phút
              </Text>

              {isCompleted && (
                <Text style={{ color: '#16a34a' }}>
                  <strong>Giá thực tế:</strong>{" "}
                  {detail.realPrice
                    ? detail.realPrice.toLocaleString("vi-VN") + " VND"
                    : "Chưa cập nhật"}
                </Text>
              )}
            </Section>
          ))}

          <Section
            style={{
              backgroundColor: '#e6f7ff',
              borderRadius: '8px',
              padding: '20px',
              margin: '32px 0',
              textAlign: 'center',
            }}
          >
            <Text>
              <strong>Địa điểm:</strong> {ENV_VARS.ADDRESS}
            </Text>

            <Text
              style={{
                fontSize: '20px',
                color: '#22A6DF',
              }}
            >
              <strong>Mã đặt lịch: {orderCode}</strong>
            </Text>
          </Section>

          <Text
            style={{
              fontSize: '15px',
              color: '#666',
              lineHeight: '1.8',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ qua hotline{' '}
            <strong>{ENV_VARS.HOTLINE}</strong> hoặc email{' '}
            <strong>{ENV_VARS.EMAIL_USER}</strong>.
          </Text>

          <Text
            style={{
              textAlign: 'center',
              marginTop: '40px',
              fontSize: '18px',
              color: '#333',
            }}
          >
            Trân trọng,
            <br />
            <strong
              style={{
                color: '#22A6DF',
                fontSize: '22px',
              }}
            >
              Pet Heaven
            </strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}