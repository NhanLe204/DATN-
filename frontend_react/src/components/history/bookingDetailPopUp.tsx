import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import orderDetailApi from '../../api/orderDetailApi';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingDetail {
  orderId: string;
  orderDetailId: string;
  fullname: string;
  email: string | null;
  phone: string;
  service: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  };
  booking_date: string;
  order_date: string;
  bookingStatus: string;
  petName: string | null;
  petType: string | null;
  petWeight: number | null;
  realPrice: number | null;
}

interface BookingDetailPopupProps {
  visible: boolean;
  onCancel: () => void;
  userId: string;
  orderId: string;
}

const statusColors = {
  pending: 'blue',
  confirmed: 'green',
  in_progress: 'purple',
  completed: 'green',
  cancelled: 'red',
};

const statusText = {
  pending: 'Chưa xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

const BookingDetailPopup: React.FC<BookingDetailPopupProps> = ({ visible, onCancel, userId, orderId }) => {
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetail[]>([]);

  const getDetailBooking = async (userId: string) => {
    const response = await orderDetailApi.getDetailBooking(userId); // Chỉ truyền userId
    return { data: response.data };
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
        if (!visible || !userId || !orderId) return;
    
        if (!userId || typeof userId !== 'string') {
            message.error('userId không hợp lệ!');
            return;
        }
    
        setLoading(true);
        try {
            console.log('userId:', userId); // Log để kiểm tra
            const response = await getDetailBooking(userId);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi khi lấy dữ liệu lịch hẹn');
            }
            const details = response.data.data || [];
            const filteredDetails = details.filter((detail: BookingDetail) => detail.orderId === orderId);
            if (filteredDetails.length === 0) {
                message.warning('Không tìm thấy lịch hẹn cho orderId này!');
            }
            setBookingDetails(filteredDetails);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết booking:', error);
            message.error(error.message || 'Không thể tải chi tiết lịch hẹn!');
            setBookingDetails([]);
        } finally {
            setLoading(false);
        }
    };

    fetchBookingDetails();
  }, [visible, userId, orderId]);

  return (
    <Modal
      title="Chi tiết lịch hẹn"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : bookingDetails.length === 0 ? (
        <p>Không tìm thấy chi tiết lịch hẹn.</p>
      ) : (
        bookingDetails.map((detail, index) => (
          <Descriptions
            key={index}
            bordered
            column={1}
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <Descriptions.Item label="Mã đơn hàng">{detail.orderId || 'Không xác định'}</Descriptions.Item>
            <Descriptions.Item label="Tên khách hàng">{detail.fullname || 'Khách vãng lai'}</Descriptions.Item>
            <Descriptions.Item label="Email">{detail.email || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detail.phone || 'Không xác định'}</Descriptions.Item>
            <Descriptions.Item label="Dịch vụ">{detail.service?.name || 'Chưa xác định'}</Descriptions.Item>
            <Descriptions.Item label="Giá dịch vụ">
              {detail.service && detail.service.price != null
                ? `${detail.service.price.toLocaleString()}đ`
                : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng">
              {detail.service && detail.service.duration != null
                ? `${detail.service.duration} phút`
                : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Tên thú cưng">{detail.petName || 'Chưa xác định'}</Descriptions.Item>
            <Descriptions.Item label="Loại thú cưng">
              {detail.petType === 'dog' ? 'Chó' : detail.petType === 'cat' ? 'Mèo' : detail.petType || 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng thú cưng">
              {detail.petWeight != null ? `${detail.petWeight} kg` : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Giá thực tế">
              {detail.realPrice != null ? `${detail.realPrice.toLocaleString()}đ` : 'Chưa tính'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian đặt">
              {detail.booking_date
                ? dayjs(detail.booking_date)
                    .tz('Asia/Ho_Chi_Minh')
                    .format('DD/MM/YYYY HH:mm')
                : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn">
              {detail.order_date
                ? dayjs(detail.order_date)
                    .tz('Asia/Ho_Chi_Minh')
                    .format('DD/MM/YYYY HH:mm')
                : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColors[detail.bookingStatus?.toLowerCase()] || 'default'}>
                {statusText[detail.bookingStatus?.toLowerCase()] || 'Không xác định'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ))
      )}
    </Modal>
  );
};

export default BookingDetailPopup;