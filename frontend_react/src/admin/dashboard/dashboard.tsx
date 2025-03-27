import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Row, Col, Table, Tag, Statistic, message } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  ExceptionOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import userApi from "../../api/userApi";
import productApi from "../../api/productsApi";
import orderApi from "../../api/orderApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { Text } = Typography;

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [canceledOrders, setCanceledOrders] = useState(0);
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
  const [currentPageOutOfStock, setCurrentPageOutOfStock] = useState(1);
  const [currentPageHotProducts, setCurrentPageHotProducts] = useState(1);

  // Cập nhật thời gian và ngày hiện tại
  useEffect(() => {
    const updateTime = () => {
      const today = new Date();
      const weekday = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
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

  // Lấy dữ liệu cho dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách người dùng
        const usersResponse = await userApi.getAllUsers();
        setTotalUsers(usersResponse.data.result?.length || 0);

        // Lấy khách hàng mới
        const newUserResponse = await userApi.getNewUsers();
        setNewCustomers(newUserResponse.data.result || []);

        // Lấy danh sách đơn hàng
        const ordersResponse = await orderApi.getAll();
        const allOrders = ordersResponse.data.result || [];

        setTotalOrders(allOrders.length);
        const canceled = allOrders.filter(
          (order) => order.status === "canceled"
        ).length;
        setCanceledOrders(canceled);

        // Định dạng dữ liệu đơn hàng cho bảng "TỔNG ĐƠN HÀNG"
        const formattedOrders = allOrders.map((order, index) => ({
          key: index.toString(),
          id: order._id || "N/A",
          customer:
            order.userID?.fullname || order.userID?.name || "Khách vãng lai",
          paymentType: order.payment_typeID?.name || "Không xác định",
          delivery: order.deliveryID?.delivery_name || "Không xác định",
          total: `${order.total_price?.toLocaleString() || 0} VNĐ`,
        }));
        setOrders(formattedOrders);

        // Lấy sản phẩm hết hàng
        const outOfStockResponse = await productApi.getProductOutStock();
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
        setOutOfStockCount(formattedOutOfStockItems.length);
        setOutOfStockProducts(formattedOutOfStockItems);

        // Lấy sản phẩm bán chạy
        const hotProductsResponse = await productApi.getHotproducts();
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
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dữ liệu doanh số cho biểu đồ
  const salesData = [
    { name: "Tháng 1", sales2024: 20, sales2025: 25 },
    { name: "Tháng 2", sales2024: 59, sales2025: 62 },
    { name: "Tháng 3", sales2024: 90, sales2025: 85 },
    { name: "Tháng 4", sales2024: 51, sales2025: null },
    { name: "Tháng 5", sales2024: 56, sales2025: null },
    { name: "Tháng 6", sales2024: 100, sales2025: null },
    { name: "Tháng 7", sales2024: 75, sales2025: null },
    { name: "Tháng 8", sales2024: 82, sales2025: null },
    { name: "Tháng 9", sales2024: 68, sales2025: null },
    { name: "Tháng 10", sales2024: 95, sales2025: null },
    { name: "Tháng 11", sales2024: 87, sales2025: null },
    { name: "Tháng 12", sales2024: 110, sales2025: null },
  ];

  // Cập nhật chartData
  const chartData = {
    labels: salesData.map((data) => data.name),
    datasets: [
      {
        label: "Doanh số 2024",
        data: salesData.map((data) => data.sales2024),
        backgroundColor: "#FFD43B",
        borderColor: "#FFD43B",
        borderWidth: 1,
      },
      {
        label: "Doanh số 2025",
        data: salesData.map((data) => data.sales2025),
        backgroundColor: "#096DEF",
        borderColor: "#096DEF",
        borderWidth: 1,
      },
    ],
  };

  // Tùy chọn cho biểu đồ Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Tháng",
        },
      },
      y: {
        title: {
          display: true,
          text: "Doanh số",
        },
        beginAtZero: true,
      },
    },
  };

  // Cấu hình cột cho bảng "TỔNG ĐƠN HÀNG"
  const ordersColumns = [
    { title: "ID đơn hàng", dataIndex: "id", key: "id" },
    { title: "Khách hàng", dataIndex: "customer", key: "customer" },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
    },
    { title: "Phương thức giao hàng", dataIndex: "delivery", key: "delivery" },
    { title: "Tổng tiền", dataIndex: "total", key: "total" },
  ];

  // Cấu hình cột cho bảng sản phẩm
  const productColumns = [
    { title: "Mã sản phẩm", dataIndex: "_id", key: "_id", width: 150 },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", width: 200 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 180,
      render: (text: string) => (
        <img
          src={text || "https://via.placeholder.com/64"}
          alt="Product"
          className="object-cover w-24 h-24"
        />
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => (
        <Tag color={status === "out_of_stock" ? "error" : "success"}>
          {status === "out_of_stock" ? "Hết hàng" : "Còn hàng"}
        </Tag>
      ),
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: any) => `${price?.toLocaleString() || 0} VNĐ`,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (category: string) => category || "Không xác định",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      width: 100,
      render: (brand: string) => brand || "Không có thương hiệu",
    },
    {
      title: "Thẻ",
      dataIndex: "tag",
      key: "tag",
      width: 100,
      render: (tag: string) =>
        tag ? <Tag color="blue">{tag}</Tag> : "Không có thẻ",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Tổng số người dùng"
                  value={totalUsers}
                  prefix={
                    <UserOutlined className="mr-2 text-xl text-cyan-500" />
                  }
                  suffix="tài khoản"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Tổng đơn hàng"
                  value={totalOrders}
                  prefix={
                    <ShoppingCartOutlined className="mr-2 text-xl text-yellow-500" />
                  }
                  suffix="đơn hàng"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Hết hàng"
                  value={outOfStockCount}
                  prefix={
                    <ExceptionOutlined className="mr-2 text-xl text-yellow-500" />
                  }
                  suffix="sản phẩm"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Đơn hàng hủy"
                  value={canceledOrders}
                  prefix={
                    <FileTextOutlined className="mr-2 text-xl text-red-500" />
                  }
                  suffix="đơn hàng"
                  loading={loading}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Biểu đồ doanh số và khách hàng mới */}
        <Row gutter={[32, 16]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card
              title="THỐNG KẾ DOANH SỐ"
              bordered={false}
              className="shadow-sm"
            >
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="Khách hàng mới"
              bordered={false}
              className="w-full shadow-sm"
            >
              <div className="space-y-6">
                {newCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={
                        customer.avatar ||
                        "https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png"
                      }
                      alt="avatar"
                      className="rounded-full w-14 h-14"
                    />
                    <div>
                      <Text
                        type="secondary"
                        className="text-base text-gray-500"
                      >
                        {customer.fullname || customer.name}
                      </Text>
                      <br />
                      <Text className="text-sm text-blue-600">
                        {customer.status || "Hoạt động"}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Bảng sản phẩm bán chạy */}
        <Card
          title="SẢN PHẨM BÁN CHẠY"
          bordered={false}
          className="mb-6 shadow-sm"
        >
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

        {/* Bảng tổng đơn hàng */}
        <Card title="TỔNG ĐƠN HÀNG" bordered={false} className="mb-6 shadow-sm">
          <Table
            columns={ordersColumns}
            dataSource={orders}
            pagination={{
              pageSize: 4,
              total: orders.length,
            }}
            className="overflow-x-auto"
            loading={loading}
          />
        </Card>

        {/* Bảng sản phẩm đã hết */}
        <Card title="SẢN PHẨM ĐÃ HẾT" bordered={false} className="shadow-sm">
          <Table
            columns={productColumns}
            dataSource={outOfStockProducts}
            pagination={{
              current: currentPageOutOfStock,
              pageSize: 4,
              onChange: (page) => setCurrentPageOutOfStock(page),
              total: outOfStockProducts.length,
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
