import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Modal, message, Tabs } from "antd";
import orderApi from "../api/orderApi";
import orderDetailApi from "../api/orderDetailApi";

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
  const [activeTab, setActiveTab] = useState<string>("all");

  const userID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userID) {
        message.error("Không tìm thấy userID!");
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
            order: item.order || [],
            status:
              item.order[0]?.bookingStatus?.toLowerCase() ||
              item.order[0]?.status?.toLowerCase() ||
              "pending",
          }));

        setBookings(userBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        if (error.response?.status === 404) {
          setBookings([]);
          console.log(error.response.data.message);
        } else {
          message.error("Không thể tải danh sách lịch đã đặt!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userID]);

  const canCancel = (booking: Booking) => {
    const now = new Date();
    const serviceDateTime = new Date(booking.booking_date || "");
    const hoursDiff =
      (serviceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return (
      hoursDiff > 12 &&
      booking.status !== "cancelled" &&
      booking.status !== "completed"
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking || !canCancel(booking)) {
      message.warning(
        "Không thể hủy lịch vì đã quá gần giờ thực hiện hoặc trạng thái không cho phép!"
      );
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy lịch",
      content: "Bạn có chắc chắn muốn hủy lịch đặt này không?",
      okText: "Hủy lịch",
      cancelText: "Không",
      onOk: async () => {
        setLoading(true);
        try {
          const orderDetailId = booking.serviceId || booking._id;
          const response = await orderApi.cancelBooking(
            booking.orderId,
            orderDetailId
          );
          if (response.success) {
            setBookings((prevBookings) =>
              prevBookings.map((b) =>
                b._id === bookingId ? { ...b, status: "cancelled" } : b
              )
            );
            message.success("Đã hủy lịch thành công!");
          } else {
            throw new Error(response.message || "Hủy lịch thất bại");
          }
        } catch (error) {
          console.error("Failed to cancel booking:", error);
          message.error("Có lỗi xảy ra khi hủy lịch!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const statusColors = {
    pending: "blue",
    confirmed: "green",
    on_progress: "purple",
    completed: "green",
    cancelled: "red",
  };

  const statusText = {
    pending: "Chưa xác nhận",
    confirmed: "Đã xác nhận",
    on_progress: "Đang thực hiện",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
  };

  const columns = [
    {
      title: "Dịch vụ",
      key: "service",
      render: (_: any, record: Booking) => (
        <span className="font-medium text-xs">
          {record.service && record.service[0]?.service_name
            ? record.service[0].service_name
            : "Chưa xác định"}
        </span>
      ),
    },
    {
      title: "Tên thú cưng",
      dataIndex: "petName",
      key: "petName",
      render: (petName: string) => (
        <span className="text-xs">{petName || "Chưa xác định"}</span>
      ),
    },
    {
      title: "Loại thú cưng",
      dataIndex: "petType",
      key: "petType",
      render: (petType: string) => (
        <span className="text-xs">{petType || "Chưa xác định"}</span>
      ),
    },
    {
      title: "Đặt lúc",
      dataIndex: "booking_date",
      key: "createdAt",
      render: (booking_date: string) => (
        <span className="text-xs">
          {booking_date
            ? new Date(booking_date).toLocaleString("vi-VN", {
              dateStyle: "short",
              timeStyle: "short",
            })
            : "Chưa xác định"}
        </span>
      ),
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "booking_date",
      key: "booking_date_display",
      render: (booking_date: string) => (
        <span className="text-xs">
          {booking_date
            ? new Date(booking_date).toLocaleDateString("vi-VN")
            : "Chưa xác định"}
        </span>
      ),
    },
    {
      title: "Giờ",
      dataIndex: "booking_date",
      key: "booking_time",
      render: (booking_date: string) => (
        <span className="text-xs">
          {booking_date
            ? new Date(booking_date).toLocaleTimeString("vi-VN", {
              timeStyle: "short",
            })
            : "Chưa xác định"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: keyof typeof statusText) => (
        <Tag color={statusColors[status]} className="text-xs">
          {statusText[status] || "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Giá thực tế",
      dataIndex: "realPrice",
      key: "realPrice",
      render: (realPrice: number | null | undefined) => (
        <span className="text-blue-500 font-medium text-xs">
          {realPrice ? `${realPrice.toLocaleString()}đ` : "Chưa tính"}
        </span>
      ),
    }
    ,
    {
      title: "Thời gian dự tính",
      dataIndex: "service",
      key: "estimated_time",
      render: (service: Service[]) => {
        const duration = service && service[0]?.duration;
        return (
          <span className="text-xs">
            {duration ? `${duration} phút` : "Chưa xác định"}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Booking) => (
        <Button
          danger
          disabled={!canCancel(record)}
          onClick={() => handleCancelBooking(record._id)}
          size="small"
        >
          Hủy
        </Button>
      ),
    },
  ];

  const tabItems = [
    { label: "Tất cả", key: "all" },
    { label: "Đã xác nhận", key: "confirmed" },
    { label: "Đang thực hiện", key: "on_progress" },
    { label: "Đã hoàn thành", key: "completed" },
    { label: "Đã hủy", key: "cancelled" },
  ];

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === activeTab);

  return (
    <Card style={{ padding: "8px" }} styles={{ body: { padding: "8px" } }}>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Lịch đã đặt</h2>
      <div className="text-sm text-red-600 mb-4">
        <p>1. Có thể hủy lịch đã hẹn trước 12h</p>
        <p>
          2. Nếu sau 15ph giờ hẹn mà quý khách không đến, và không có liên lạc
          thì lịch sẽ bị hủy
        </p>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="mb-2"
      />
      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        loading={loading}
        size="small"
      />
    </Card>
  );
};

export default BookingHistory;
