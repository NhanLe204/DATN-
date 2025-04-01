import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  notification,
} from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import orderDetailApi from "../../api/orderDetailApi";

const { Option } = Select;

interface Booking {
  key: string;
  id: string;
  orderId: string;
  username: string;
  orderDate: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  estimatedPrice: number;
  duration: number;
  status: string;
  petName?: string; 
  petType?: string; 
}

const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const BookingManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const fetchBookings = async () => {
    try {
      const response = await orderDetailApi.getAllBookings();
      console.log("dulieu", response);

      const bookingData = response.data.map((booking: any) => ({
        key: booking._id,
        id: booking._id,
        orderId: booking.orderId,
        username: booking.user?.name || "Unknown User",
        orderDate: booking.order_date
          ? new Date(booking.order_date).toLocaleString()
          : "N/A",
        serviceName: booking.service?.name || "Unknown Service",
        bookingDate: booking.booking_date
          ? new Date(booking.booking_date).toLocaleDateString()
          : "N/A",
        bookingTime: booking.booking_date
          ? new Date(booking.booking_date).toLocaleTimeString()
          : "N/A",
        estimatedPrice: booking.service?.price || 0,
        duration: booking.service?.duration || 0,
        status: booking.status || "PENDING",
        petName: booking.petName || "N/A", // Lấy petName từ API
        petType: booking.petType || "N/A", // Lấy petType từ API
      }));

      setBookings(bookingData);
      setFilteredBookings(bookingData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());

    const filtered = bookings.filter((booking) => {
      const normalizedServiceName = removeAccents(booking.serviceName.toLowerCase());
      const normalizedUsername = removeAccents(booking.username.toLowerCase());
      const normalizedPetName = removeAccents(booking.petName?.toLowerCase() || "");
      const normalizedPetType = removeAccents(booking.petType?.toLowerCase() || "");
      return (
        normalizedServiceName.includes(normalizedSearchText) ||
        booking.orderId.toLowerCase().includes(normalizedSearchText) ||
        normalizedUsername.includes(normalizedSearchText) ||
        booking.status.toLowerCase().includes(normalizedSearchText) ||
        normalizedPetName.includes(normalizedSearchText) ||
        normalizedPetType.includes(normalizedSearchText)
      );
    });

    setFilteredBookings(filtered);
  };
  const handleComplete = async (bookingId: string) => {
    try {
      await orderDetailApi.updateStatus(bookingId, { status: "COMPLETED" });
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "COMPLETED" } : b
      );
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings);
      notification.success({
        message: "Thành công",
        description: "Đã cập nhật trạng thái thành Hoàn thành!",
      });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật trạng thái!",
      });
    }
  };

  
  const columns = [
    {
      title: "Người đặt",
      dataIndex: "username",
      key: "username",
      width: 150,
      align: "left" as const,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Tên thú cưng",
      dataIndex: "petName",
      key: "petName",
      width: 120,
      align: "left" as const,
      render: (petName: string) => <span>{petName}</span>,
    },
    {
      title: "Loại thú cưng",
      dataIndex: "petType",
      key: "petType",
      width: 120,
      align: "left" as const,
      render: (petType: string) => <span>{petType}</span>,
    },
    {
      title: "Đặt lúc",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 180,
      align: "left" as const,
    },
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 200,
      align: "left" as const,
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 120,
      align: "left" as const,
    },
    {
      title: "Giờ đặt",
      dataIndex: "bookingTime",
      key: "bookingTime",
      width: 100,
      align: "left" as const,
    },
    {
      title: "Giá dự tính",
      dataIndex: "estimatedPrice",
      key: "estimatedPrice",
      width: 120,
      align: "left" as const,
      render: (price: number) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Thời gian (phút)",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      align: "left" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <span
          style={{
            color:
              status === "PENDING"
                ? "#fa8c16"
                : status === "CONFIRMED"
                ? "#52c41a"
                : status === "COMPLETED"
                ? "#1890ff"
                : "#ff4d4f",
          }}
        >
          {status}
        </span>
      ),
      align: "left" as const,
    },  
    {
      title: "Chức năng",
      key: "action",
      width: 150,
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type="primary"
            disabled={record.status !== "CONFIRMED"} 
            onClick={() => handleComplete(record.id)}
            size="small"
          >
            Hoàn thành
          </Button>
        </Space>
      ),
      align: "left" as const,
    },
  ];

  const handleEdit = (record: Booking) => {
    setSelectedBooking(record);
    form.setFieldsValue({ status: record.status });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      if (selectedBooking) {
        try {
          await orderDetailApi.updateStatus(selectedBooking.id, {
            status: values.status,
          });
          const updatedBookings = bookings.map((b) =>
            b.key === selectedBooking.key ? { ...b, status: values.status } : b
          );

          setBookings(updatedBookings);
          setFilteredBookings(updatedBookings);

          setIsEditModalVisible(false);
          notification.success({
            message: "Thành công",
            description: "Trạng thái đặt lịch đã được cập nhật!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error) {
          console.error("Error updating booking status:", error);
          Modal.error({
            title: "Lỗi",
            content: "Không thể cập nhật trạng thái đặt lịch!",
          });
        }
      }
    });
  };

  const handleModalCancel = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={filteredBookings}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
          rowKey="key"
        />
      </Card>

      <Modal
        title="Cập nhật trạng thái đặt lịch"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleModalCancel}
        okText="Lưu & Đóng"
        cancelText="Hủy bỏ"
      >
        {selectedBooking && (
          <Form form={form} layout="vertical">
            <Form.Item label="Order ID">
              <Input value={selectedBooking.orderId} disabled />
            </Form.Item>
            <Form.Item label="Người đặt">
              <Input value={selectedBooking.username} disabled />
            </Form.Item>
            <Form.Item label="Dịch vụ">
              <Input value={selectedBooking.serviceName} disabled />
            </Form.Item>
            <Form.Item label="Tên thú cưng">
              <Input value={selectedBooking.petName} disabled />
            </Form.Item>
            <Form.Item label="Loại thú cưng">
              <Input value={selectedBooking.petType} disabled />
            </Form.Item>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value="PENDING">PENDING</Option>
                <Option value="CONFIRMED">CONFIRMED</Option>
                <Option value="COMPLETED">COMPLETED</Option>
                <Option value="CANCELLED">CANCELLED</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </motion.div>
  );
};

export default BookingManager;