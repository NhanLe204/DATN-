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

export enum BookingStatus {
  PENDING = "ĐANG CHỜ",
  CONFIRMED = "ĐÃ XÁC NHẬN",
  IN_PROGRESS = "ĐANG THỰC HIỆN",
  COMPLETED = "HOÀN THÀNH",
  CANCELLED = "ĐÃ HỦY",
}

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
  bookingStatus: string;
  petName?: string;
  petType?: string;
  petWeight?: number;
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
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [startForm] = Form.useForm();

  const fetchBookings = async () => {
    try {
      const response = await orderDetailApi.getAllBookings();
      const bookingData = response.data.map((booking: any) => ({
        key: booking.orderId,
        id: booking.orderId,
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
        bookingStatus:
          booking.bookingStatus === "PENDING"
            ? BookingStatus.PENDING
            : booking.bookingStatus === "CONFIRMED"
            ? BookingStatus.CONFIRMED
            : booking.bookingStatus === "IN_PROGRESS"
            ? BookingStatus.IN_PROGRESS
            : booking.bookingStatus === "COMPLETED"
            ? BookingStatus.COMPLETED
            : BookingStatus.CANCELLED,
        petName: booking.petName || "N/A",
        petType: booking.petType || "N/A",
        petWeight: booking.petWeight || 0,
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
      const normalizedServiceName = removeAccents(
        booking.serviceName.toLowerCase()
      );
      const normalizedUsername = removeAccents(booking.username.toLowerCase());
      const normalizedPetName = removeAccents(
        booking.petName?.toLowerCase() || ""
      );
      const normalizedPetType = removeAccents(
        booking.petType?.toLowerCase() || ""
      );
      return (
        normalizedServiceName.includes(normalizedSearchText) ||
        booking.orderId.toLowerCase().includes(normalizedSearchText) ||
        normalizedUsername.includes(normalizedSearchText) ||
        removeAccents(booking.bookingStatus.toLowerCase()).includes(normalizedSearchText) ||
        normalizedPetName.includes(normalizedSearchText) ||
        normalizedPetType.includes(normalizedSearchText)
      );
    });

    setFilteredBookings(filtered);
  };

  const handleStart = (record: Booking) => {
    setSelectedBooking(record);
    startForm.setFieldsValue({ petWeight: record.petWeight || 0 });
    setIsStartModalVisible(true);
  };

  const handleStartModalOk = () => {
    startForm.validateFields().then(async (values) => {
      if (selectedBooking) {
        try {
          await orderDetailApi.changeBookingStatus(
            selectedBooking.orderId,
            "IN_PROGRESS" // Gửi giá trị gốc cho API
          );
          const updatedBookings = bookings.map((b) =>
            b.orderId === selectedBooking.orderId
              ? {
                  ...b,
                  bookingStatus: BookingStatus.IN_PROGRESS,
                  petWeight: values.petWeight,
                  estimatedPrice: calculatePrice(
                    b.serviceName,
                    values.petWeight
                  ),
                }
              : b
          );

          setBookings(updatedBookings);
          setFilteredBookings(updatedBookings);
          setIsStartModalVisible(false);
          notification.success({
            message: "Thành công",
            description: "Đã bắt đầu dịch vụ!",
          });
        } catch (error) {
          notification.error({
            message: "Lỗi",
            description: "Không thể cập nhật trạng thái!",
          });
        }
      }
    });
  };

  const handleComplete = async (orderId: string) => {
    try {
      await orderDetailApi.changeBookingStatus(
        orderId,
        "COMPLETED" // Gửi giá trị gốc cho API
      );
      const updatedBookings = bookings.map((b) =>
        b.orderId === orderId
          ? { ...b, bookingStatus: BookingStatus.COMPLETED }
          : b
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

  const handleEdit = (record: Booking) => {
    setSelectedBooking(record);
    form.setFieldsValue({ bookingStatus: record.bookingStatus });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      if (selectedBooking) {
        try {
          // Chuyển đổi trạng thái tiếng Việt về giá trị gốc để gửi API
          const statusToSend =
            values.bookingStatus === BookingStatus.PENDING
              ? "PENDING"
              : values.bookingStatus === BookingStatus.CONFIRMED
              ? "CONFIRMED"
              : values.bookingStatus === BookingStatus.IN_PROGRESS
              ? "IN_PROGRESS"
              : values.bookingStatus === BookingStatus.COMPLETED
              ? "COMPLETED"
              : "CANCELLED";

          await orderDetailApi.changeBookingStatus(
            selectedBooking.orderId,
            statusToSend
          );
          const updatedBookings = bookings.map((b) =>
            b.orderId === selectedBooking.orderId
              ? { ...b, bookingStatus: values.bookingStatus }
              : b
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
    setIsStartModalVisible(false);
    form.resetFields();
    startForm.resetFields();
  };

  const calculatePrice = (serviceName: string, petWeight: number) => {
    const basePrice = 50000;
    const weightFactor = 10000;
    return basePrice + petWeight * weightFactor;
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      width: 50,
      align: "left" as const,
      render: (text: string) => (
        <div
          style={{
            width: "50px",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            whiteSpace: "normal",
            lineHeight: "1.2",
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
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
      dataIndex: "bookingStatus",
      key: "bookingStatus",
      width: 120,
      render: (bookingStatus: string) => (
        <span
          style={{
            color:
              bookingStatus === BookingStatus.PENDING
                ? "#fa8c16"
                : bookingStatus === BookingStatus.CONFIRMED
                ? "#52c41a"
                : bookingStatus === BookingStatus.IN_PROGRESS
                ? "#722ed1"
                : bookingStatus === BookingStatus.COMPLETED
                ? "#1890ff"
                : "#ff4d4f",
          }}
        >
          {bookingStatus}
        </span>
      ),
      align: "left" as const,
    },
    {
      title: "Chức năng",
      key: "action",
      width: 250,
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type="primary"
            disabled={record.bookingStatus !== BookingStatus.CONFIRMED}
            onClick={() => handleStart(record)}
            size="small"
          >
            Bắt đầu
          </Button>
          <Button
            type="primary"
            disabled={record.bookingStatus !== BookingStatus.IN_PROGRESS}
            onClick={() => handleComplete(record.orderId)}
            size="small"
          >
            Hoàn thành
          </Button>
        </Space>
      ),
      align: "left" as const,
    },
  ];

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
              name="bookingStatus"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value={BookingStatus.PENDING}>ĐANG CHỜ</Option>
                <Option value={BookingStatus.CONFIRMED}>ĐÃ XÁC NHẬN</Option>
                <Option value={BookingStatus.IN_PROGRESS}>ĐANG THỰC HIỆN</Option>
                <Option value={BookingStatus.COMPLETED}>HOÀN THÀNH</Option>
                <Option value={BookingStatus.CANCELLED}>ĐÃ HỦY</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Bắt đầu dịch vụ - Cân thú cưng"
        open={isStartModalVisible}
        onOk={handleStartModalOk}
        onCancel={handleModalCancel}
        okText="Bắt đầu"
        cancelText="Hủy bỏ"
      >
        {selectedBooking && (
          <Form form={startForm} layout="vertical">
            <Form.Item label="Order ID">
              <Input value={selectedBooking.orderId} disabled />
            </Form.Item>
            <Form.Item label="Tên thú cưng">
              <Input value={selectedBooking.petName} disabled />
            </Form.Item>
            <Form.Item label="Dịch vụ">
              <Input value={selectedBooking.serviceName} disabled />
            </Form.Item>
            <Form.Item
              label="Cân nặng (kg)"
              name="petWeight"
              rules={[
                { required: true, message: "Vui lòng nhập cân nặng thú cưng!" },
                {
                  type: "number",
                  min: 0,
                  message: "Cân nặng phải lớn hơn hoặc bằng 0!",
                },
              ]}
            >
              <Input type="number" step="0.1" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </motion.div>
  );
};

export default BookingManager;