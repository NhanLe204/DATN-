import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Tag, Statistic, message } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ExceptionOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import userApi from "../../api/userApi";
import productsApi from "../../api/productsApi";
import orderApi from "../../api/orderApi";
import orderDetailApi from "../../api/orderDetailApi";

const tableContainerStyle = {
  height: "250px",
  overflowY: "auto",
} as React.CSSProperties;

const { Text } = Typography;

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [canceledAppointments, setCanceledAppointments] = useState(0);

  interface Customer {
    avatar?: string;
    fullname?: string;
    name?: string;
    status?: string;
  }

  const [newCustomers, setNewCustomers] = useState<Customer[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPageHotProducts, setCurrentPageHotProducts] = useState(1);

  useEffect(() => {
    const updateTime = () => {
      const today = new Date();
      const weekday = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const day = weekday[today.getDay()];
      let dd = today.getDate().toString().padStart(2, "0");
      let mm = (today.getMonth() + 1).toString().padStart(2, "0");
      const yyyy = today.getFullYear();
      const h = today.getHours();
      const m = today.getMinutes().toString().padStart(2, "0");
      const s = today.getSeconds().toString().padStart(2, "0");

      setCurrentDate(`${day}, ${dd}/${mm}/${yyyy}`);
      setCurrentTime(`${h} giờ ${m} phút ${s} giây`);
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const usersResponse = await userApi.getAllUsers();
        setTotalUsers(usersResponse.data.result?.length || 0);

        const newUserResponse = await userApi.getNewUsers();
        const limitedCustomers = (newUserResponse.data.result || []).slice(0, 4);
        setNewCustomers(limitedCustomers);

        const recentOrdersResponse = await orderApi.get4New();
        const recentOrders = recentOrdersResponse.data.result || [];

        setOrders(
          recentOrders.map((order, index) => ({
            key: index.toString(),
            id: order.orderId || "N/A",
            paymentType: order.paymentType || "Không xác định",
            delivery: order.delivery || "Không xác định",
            total: order.totalPrice || "0 VNĐ",
          }))
        );
        setTotalOrders(recentOrders.length);
        setCanceledOrders(0);

        const outOfStockResponse = await productsApi.getProductOutStock();
        const outOfStockItems = outOfStockResponse.data.result || [];
        const formattedOutOfStockItems = outOfStockItems.map((product) => ({
          key: product._id,
          _id: product._id,
          name: product.name,
          image: product.image_url?.[0] || "https://via.placeholder.com/64",
          images: product.image_url || [],
          quantity: product.quantity || 0,
          status: product.status,
          price: product.price,
          category: product.category_id?.name || "Không xác định",
          brand: product.brand_id?.brand_name || "Không có thương hiệu",
          tag: product.tag_id?.tag_name || "Không có thẻ",
        }));
        setOutOfStockProducts(formattedOutOfStockItems);

        const hotProductsResponse = await productsApi.getHotproducts();
        const hotProductsItems = hotProductsResponse.data.result || [];
        const formattedHotProducts = hotProductsItems.map((product) => ({
          key: product._id,
          _id: product._id,
          name: product.name,
          image: product.image_url?.[0] || "https://via.placeholder.com/64",
          images: product.image_url || [],
          quantity: product.quantity || 0,
          status: product.status,
          price: product.price,
          category: product.category_id?.name || "Không xác định",
          brand: product.brand_id?.brand_name || "Không có thương hiệu",
          tag: product.tag_id?.tag_name || "Không có thẻ",
        }));
        setHotProducts(formattedHotProducts);

        const allBookingsResponse = await orderDetailApi.getAllBookings();
        const allBookings = allBookingsResponse.data || [];
        setTotalAppointments(allBookings.length);

        const cancelledBookingsResponse = await orderDetailApi.getCancelled();
        if (cancelledBookingsResponse) {
          const cancelledBookings = cancelledBookingsResponse.data || [];
          setCanceledAppointments(cancelledBookings.length);
        } else {
          setCanceledAppointments(0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const ordersColumns = [
    { title: "ID đơn hàng", dataIndex: "id", key: "id", width: 100 },
    { title: "Thanh toán", dataIndex: "paymentType", key: "paymentType", width: 200 },
    { title: "Giao hàng", dataIndex: "delivery", key: "delivery", width: 200 },
    { title: "Tổng tiền", dataIndex: "total", key: "total", width: 100 },
  ];

  const productColumns = [
    { title: "Mã SP", dataIndex: "_id", key: "_id", width: 100 },
    { title: "Tên", dataIndex: "name", key: "name", width: 150 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (text: string) => (
        <img
          src={text || "https://via.placeholder.com/64"}
          alt="Product"
          className="object-cover w-16 h-16"
        />
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "out_of_stock" ? "error" : "success"}>
          {status === "out_of_stock" ? "Hết hàng" : "Còn hàng"}
        </Tag>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: any) => `${price?.toLocaleString() || 0} VNĐ`,
    },
    { title: "Danh mục", dataIndex: "category", key: "category", width: 100 },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand", width: 100 },
    {
      title: "Thẻ",
      dataIndex: "tag",
      key: "tag",
      width: 100,
      render: (tag: string) => (tag ? <Tag color="blue">{tag}</Tag> : "Không có"),
    },
  ];

  const customerColumns = [
    {
      title: "Khách hàng",
      dataIndex: "fullname",
      key: "fullname",
      render: (_: any, record: Customer) => (
        <div className="flex items-center space-x-2">
          <img
            src={record.avatar || "https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png"}
            alt="avatar"
            className="rounded-full w-8 h-8"
          />
          <Text>{record.fullname || record.name || "Không xác định"}</Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Text className="text-sm text-blue-600">{status || "Hoạt động"}</Text>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Tổng số người dùng"
                  value={totalUsers}
                  prefix={<UserOutlined className="mr-2 text-xl text-cyan-500" />}
                  suffix="tài khoản"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Đơn hàng mới"
                  value={totalOrders}
                  prefix={<ShoppingCartOutlined className="mr-2 text-xl text-yellow-500" />}
                  suffix="đơn hàng"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Hết hàng"
                  value={outOfStockProducts.length}
                  prefix={<ExceptionOutlined className="mr-2 text-xl text-yellow-500" />}
                  suffix="sản phẩm"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Đơn hàng hủy"
                  value={canceledOrders}
                  prefix={<FileTextOutlined className="mr-2 text-xl text-red-500" />}
                  suffix="đơn hàng"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Tổng lịch hẹn"
                  value={totalAppointments}
                  prefix={<CalendarOutlined className="mr-2 text-xl text-green-500" />}
                  suffix="lịch hẹn"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Lịch đã hủy"
                  value={canceledAppointments}
                  prefix={<CloseCircleOutlined className="mr-2 text-xl text-red-500" />}
                  suffix="lịch hẹn"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={16}> 
            <Card title="TỔNG ĐƠN HÀNG" bordered={false} className="shadow-sm">
              <div style={tableContainerStyle}>
                <Table
                  columns={ordersColumns}
                  dataSource={orders}
                  pagination={false} 
                  className="overflow-x-auto"
                  loading={loading}
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}> 
            <Card title="KHÁCH HÀNG MỚI" bordered={false} className="shadow-sm">
              <div style={tableContainerStyle}>
                <Table
                  columns={customerColumns}
                  dataSource={newCustomers}
                  pagination={false}
                  className="overflow-x-auto"
                  loading={loading}
                  size="small"
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="SẢN PHẨM BÁN CHẠY" bordered={false} className="mb-6 shadow-sm">
          <Table
            columns={productColumns}
            dataSource={hotProducts}
            pagination={{
              current: currentPageHotProducts,
              pageSize: 4,
              onChange: (page) => setCurrentPageHotProducts(page),
              total: hotProducts.length,
            }}
            className="overflow-x-auto"
            loading={loading}
          />
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;