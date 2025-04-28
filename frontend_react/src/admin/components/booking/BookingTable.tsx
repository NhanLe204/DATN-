import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Booking, BookingStatus } from '../../booking/booking';

interface BookingTableProps {
  bookings: Booking[];
  onEdit: (record: Booking) => void;
  onStart: (record: Booking) => void;
  onComplete: (orderId: string) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, onEdit, onStart, onComplete }) => {
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 50,
      align: 'left' as const,
      render: (text: string) => (
        <div
          style={{
            width: '50px',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.2',
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Người đặt',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 150,
      align: 'left' as const,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      align: 'left' as const,
      render: (phone: number) => <span>{phone}</span>,
    },
    {
      title: 'Đặt lúc',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 180,
      align: 'left' as const,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 200,
      align: 'left' as const,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      width: 120,
      align: 'left' as const,
    },
    {
      title: 'Giờ đặt',
      dataIndex: 'bookingTime',
      key: 'bookingTime',
      width: 100,
      align: 'left' as const,
    },
    {
      title: 'Thời gian (phút)',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      align: 'left' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      width: 120,
      render: (bookingStatus: string) => (
        <span
          style={{
            color:
              bookingStatus === BookingStatus.PENDING
                ? '#fa8c16'
                : bookingStatus === BookingStatus.CONFIRMED
                ? '#52c41a'
                : bookingStatus === BookingStatus.IN_PROGRESS
                ? '#722ed1'
                : bookingStatus === BookingStatus.COMPLETED
                ? '#1890ff'
                : '#ff4d4f',
          }}
        >
          {bookingStatus}
        </span>
      ),
      align: 'left' as const,
    },
    {
      title: 'Giá thực tế',
      dataIndex: 'realPrice',
      key: 'realPrice',
      width: 150,
      render: (realPrice: number | undefined, record: Booking) => (
        <span>
          {record.bookingStatus === BookingStatus.IN_PROGRESS ||
          record.bookingStatus === BookingStatus.COMPLETED
            ? realPrice
              ? `${realPrice.toLocaleString('vi-VN')} VND`
              : 'Chưa tính'
            : 'Chưa tính'}
        </span>
      ),
      align: 'left' as const,
    },
    {
      title: 'Chức năng',
      key: 'action',
      width: 280,
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
            disabled={record.bookingStatus === BookingStatus.COMPLETED}
          />
          <Button
            type="primary"
            disabled={record.bookingStatus !== BookingStatus.CONFIRMED}
            onClick={() => onStart(record)}
            size="small"
          >
            Bắt đầu
          </Button>
          <Button
            type="primary"
            disabled={record.bookingStatus !== BookingStatus.IN_PROGRESS}
            onClick={() => onComplete(record.orderId)}
            size="small"
          >
            Hoàn thành
          </Button>
        </Space>
      ),
      align: 'left' as const,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={bookings}
      pagination={{ pageSize: 10 }}
      className="overflow-x-auto"
      rowKey="key"
    />
  );
};

export default BookingTable;