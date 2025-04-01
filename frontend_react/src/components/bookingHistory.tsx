import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Modal, message, Tabs } from "antd";
import orderDetailApi from "../api/orderDetailApi";

interface Service {
  service_name: string;
  service_price: number;
  duration: number; // Duration in minutes
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
}

interface Booking {
  _id: string;
  orderId: string;
  userID?: string;
  serviceId: string;
  productId: string | null;
  quantity: number;
  product_price: number;
  total_price: number;
  booking_date: string;
  service: Service[];
  status?: string;
  petName?: string;
  petType?: string;
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
        console.log("Bookings response:", response);
        if (response.success) {
          const bookingsWithStatus = response.data.map((booking: Booking) => ({
            ...booking,
            status: booking.status?.toLowerCase() || "pending",
          }));
          setBookings(bookingsWithStatus);
        } else {
          setBookings([]);
          console.log(response.message);
        }
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
    const serviceDateTime = new Date(booking.booking_date);
    const hoursDiff = (serviceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return (
      hoursDiff > 24 &&
      booking.status !== "cancelled" &&
      booking.status !== "completed"
    );
  };

  const handleCancelBooking = (bookingId: string) => {
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
          setBookings((prevBookings) =>
            prevBookings.map((b) =>
              b._id === bookingId ? { ...b, status: "cancelled" } : b
            )
          );
          message.success("Đã hủy lịch thành công!");
        } catch (error) {
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
    completed: "green",
    cancelled: "red",
  };

  const statusText = {
    pending: "Chưa xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
  };

  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      render: (service: Service[]) => (
        <span className="font-medium text-xs">
          {service && service[0]?.service_name
            ? service[0].service_name
            : "Dịch vụ không xác định"}
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
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => (
        <span className="text-xs">
          {new Date(createdAt).toLocaleString("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "booking_date",
      key: "booking_date_display",
      render: (booking_date: string) => (
        <span className="text-xs">
          {new Date(booking_date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Giờ",
      dataIndex: "booking_date",
      key: "booking_time",
      render: (booking_date: string) => (
        <span className="text-xs">
          {new Date(booking_date).toLocaleTimeString("vi-VN", { timeStyle: "short" })}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: keyof typeof statusText) => (
        <Tag color={statusColors[status]} className="text-xs">
          {statusText[status]}
        </Tag>
      ),
    },
    {
      title: "Giá dự tính",
      dataIndex: "total_price",
      key: "total_price",
      render: (total_price: number) => (
        <span className="text-blue-500 font-medium text-xs">
          {total_price.toLocaleString()}đ
        </span>
      ),
    },
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
    { label: "Chưa xác nhận", key: "pending" },
    { label: "Đã xác nhận", key: "confirmed" },
    { label: "Đã hoàn thành", key: "completed" },
    { label: "Đã hủy", key: "cancelled" },
  ];

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === activeTab);

  return (
    <Card
      style={{ padding: "8px" }} // Giảm padding của Card
      bodyStyle={{ padding: "8px" }} // Giảm padding bên trong Card
    >
      <h2 className="text-xl font-bold text-gray-800 mb-2">Lịch đã đặt</h2>
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