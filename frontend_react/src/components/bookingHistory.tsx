import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, message, Tabs } from 'antd';
import orderApi from '../api/orderApi';
import orderDetailApi from '../api/orderDetailApi';
import BookingDetailPopup from './history/bookingDetailPopUp';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Service {
  _id: string;
  service_name: string;
  service_price: number;
  duration: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  userID: string;
  fullname: string;
  phone: string;
  paymentOrderCode: string | null;
  payment_typeID: string | null;
  deliveryID: string | null;
  couponID: string | null;
  order_date: string;
  realPrice: number;
  shipping_address: string | null;
  payment_status: string;
  status: string | null;
  bookingStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;
  orderId: string;
  userID?: string;
  serviceId?: string;
  quantity?: number;
  total_price: number;
  booking_date?: string;
  service?: Service[];
  order?: Order[];
  petName?: string;
  petType?: string;
  status: string;
}

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const userID = localStorage.getItem('accountID')?.replace(/"/g, '').trim();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userID) {
        message.error('Không tìm thấy userID!');
        return;
      }

      setLoading(true);
      try {
        const response = await orderDetailApi.getBookingsByUserId(userID);
        const rawData = response.data;

        if (!rawData || rawData.length === 0) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const userBookings = rawData
          .filter((item: any) => item.order[0]?.userID === userID)
          .map((item: any) => ({
            _id: item._id,
            orderId: item.orderId,
            userID: item.order[0]?.userID,
            serviceId: item.serviceId,
            service: item.service || [],
            quantity: item.quantity,
            total_price: item.total_price,
            booking_date: item.booking_date,
            petName: item.petName,
            petType: item.petType,
            realPrice: item.realPrice,
            order: item.order || [],
            status:
              item.order[0]?.bookingStatus?.toLowerCase() ||
              item.order[0]?.status?.toLowerCase() ||
              'pending',
          }));

        setBookings(userBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        if (error.response?.status === 404) {
          setBookings([]);
          console.log(error.response.data.message);
        } else {
          message.error('Không thể tải danh sách lịch đã đặt!');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userID]);

  const canCancel = (booking: Booking) => {
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const serviceDateTime = dayjs(booking.booking_date).tz('Asia/Ho_Chi_Minh');
    const hoursDiff = serviceDateTime.diff(now, 'hour', true);
    return (
      hoursDiff > 12 &&
      booking.status !== 'cancelled' &&
      booking.status !== 'completed'
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) {
      message.error('Không tìm thấy lịch hẹn!');
      return;
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      message.warning('Không thể hủy vì lịch hẹn đã bị hủy hoặc hoàn thành!');
      return;
    }

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const serviceDateTime = dayjs(booking.booking_date).tz('Asia/Ho_Chi_Minh');
    const hoursDiff = serviceDateTime.diff(now, 'hour', true);
    if (hoursDiff <= 12) {
      message.warning('Không thể hủy vì thời gian thực hiện cách hiện tại dưới 12 tiếng!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận hủy lịch',
      content: 'Bạn có chắc chắn muốn hủy lịch đặt này không?',
      okText: 'Hủy lịch',
      cancelText: 'Không',
      onOk: async () => {
        setLoading(true);
        try {
          const orderDetailId = booking._id;
          const response = await orderApi.cancelBooking(booking.orderId, orderDetailId);
          if (response.success) {
            setBookings((prevBookings) =>
              prevBookings.map((b) =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
              )
            );
            message.success('Đã hủy lịch thành công!');
          } else {
            message.error(response.message || 'Hủy lịch thất bại!');
          }
        } catch (error) {
          console.error('Failed to cancel booking:', error);
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy lịch!');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrderId('');
  };

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

  const columns = [
    {
      title: 'Tên khách hàng',
      key: 'fullname',
      render: (_: any, record: Booking) => (
        <span className="font-medium text-sm md:text-base">
          {record.order && record.order[0]?.fullname
            ? record.order[0].fullname
            : 'Khách vãng lai'}
        </span>
      ),
      responsive: ['md'], // Chỉ hiển thị trên màn hình medium trở lên
    },
    {
      title: 'Ngày giờ đặt',
      key: 'booking_time_combined',
      render: (_: any, record: Booking) => {
        const bookingDate = record.booking_date
          ? new Date(record.booking_date)
          : null;
        return (
          <span className="text-sm md:text-base">
            {bookingDate
              ? `${bookingDate.toLocaleDateString('vi-VN')} ${bookingDate.toLocaleTimeString('vi-VN', { timeStyle: 'short' })}`
              : 'Chưa xác định'}
          </span>
        );
      },
      width: '30%',
    },
    {
      title: 'Thời gian dự tính',
      dataIndex: 'service',
      key: 'estimated_time',
      render: (service: Service[]) => {
        const duration = service && service[0]?.duration;
        return (
          <span className="text-sm md:text-base font-medium">
            {duration ? `${duration} phút` : 'Chưa xác định'}
          </span>
        );
      },
      responsive: ['md'], // Chỉ hiển thị trên màn hình medium trở lên
    },
    {
      title: 'Giá thực tế',
      dataIndex: 'realPrice',
      key: 'realPrice',
      render: (realPrice: number | null | undefined) => (
        <span className="text-blue-500 font-medium text-sm md:text-base">
          {realPrice ? `${realPrice.toLocaleString()}đ` : 'Chưa tính'}
        </span>
      ),
      width: '20%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusText) => (
        <Tag color={statusColors[status]} className="text-xs md:text-sm">
          {statusText[status] || 'Không xác định'}
        </Tag>
      ),
      width: '20%',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Booking) => (
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            danger
            disabled={!canCancel(record)}
            onClick={() => handleCancelBooking(record._id)}
            size="small"
            className="text-xs md:text-sm"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={() => handleViewDetails(record.orderId)}
            size="small"
            className="text-xs md:text-sm"
          >
            Xem chi tiết
          </Button>
        </div>
      ),
      width: '30%',
    },
  ];

  const tabItems = [
    { label: 'Tất cả', key: 'all' },
    { label: 'Đã xác nhận', key: 'confirmed' },
    { label: 'Đang thực hiện', key: 'on_progress' },
    { label: 'Đã hoàn thành', key: 'completed' },
    { label: 'Đã hủy', key: 'cancelled' },
  ];

  const filteredBookings =
    activeTab === 'all'
      ? bookings
      : bookings.filter((booking) => booking.status === activeTab);

  const tableHeaderStyle = {
    whiteSpace: 'nowrap',
    overflow: 'visible',
    fontSize: '14px',
  };

  return (
    <Card className="p-2 md:p-4 w-full max-w-7xl mx-auto" bodyStyle={{ padding: '8px' }}>
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-4">Lịch đã đặt</h2>
      <div className="text-xs md:text-sm text-red-600 mb-4 space-y-1">
        <p>1. Chỉ có thể hủy lịch hẹn trước ít nhất 12 tiếng so với giờ thực hiện</p>
        <p>
          2. Nếu sau 15ph giờ hẹn mà quý khách không đến, và không có liên lạc
          thì lịch sẽ bị hủy
        </p>
        <p>
          3. Giá được tính tại shop khi đã cân khối lượng của thú cưng
        </p>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
       className="mb-2 text-xs md:text-sm hidden md:block"
      />
      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        loading={loading}
        size="small"
        components={{
          header: {
            cell: (props: any) => (
              <th {...props} style={{ ...props.style, ...tableHeaderStyle }} className="text-xs md:text-sm" />
            ),
          },
        }}
        className="text-xs md:text-sm"
      />
      {userID && (
        <BookingDetailPopup
          visible={isModalVisible}
          onCancel={handleCloseModal}
          userId={userID}
          orderId={selectedOrderId}
        />
      )}
    </Card>
  );
};

export default BookingHistory;