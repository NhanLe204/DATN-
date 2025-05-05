import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Tag, Statistic, message } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  ExceptionOutlined,
  CalendarOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { Link } from "react-router-dom";
import userApi from "../../api/userApi";
import productsApi from "../../api/productsApi";
import orderApi from "../../api/orderApi";
import orderDetailApi from "../../api/orderDetailApi";
import moment from "moment";

const tableContainerStyle = {
  overflowY: "auto",
} as React.CSSProperties;

const { Text } = Typography;

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [canceledOrders, setCanceledOrders] = useState([]); // Đã có state này
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [canceledAppointments, setCanceledAppointments] = useState(0);
  const [currentPageOrders, setCurrentPageOrders] = useState(1);

  interface Customer {
    avatar?: string;
    fullname?: string;
    name?: string;
    status?: string;
  }

  // Định nghĩa interface Product và Order từ đoạn mã của OrderList
  interface Product {
    orderDetailId: string;
    productId: string | null;
    productName: string;
    productPrice: number;
    productImage: string | null;
    quantity: number;
    totalPrice: number;
  }

  interface Order {
    key: string;
    orderId: string;
    fullname: string;
    orderDate?: string;
    product: string;
    status: "PENDING" | "PROCESSING" | "SHIPPING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    quantity?: number;
    price?: string;
    products?: Product[];
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

        const loyalUsers = await userApi.getLoyalUsers();
        console.log(loyalUsers, "user thân thiết");
        
        const limitedCustomers = (loyalUsers.data.result || []).slice(0, 4);
        setNewCustomers(limitedCustomers);

        const pendingOrders = await orderApi.getPendingOrders();
        console.log(pendingOrders, "đơn hàng chờ");

        const recentOrders = pendingOrders.data.result || [];

        const formattedOrders = recentOrders.map((order: any, index: number) => ({
          key: index.toString(),
          id: order.orderId || "N/A",
          shortId: order.orderId ? `**${order.orderId.slice(-4)}` : "N/A",
          paymentType: order.paymentType || "Không xác định",
          delivery: order.delivery || "Không xác định",
          total: order.totalPrice || "0 VNĐ",
          fullname: order.fullname || "Khách vãng lai",
        }));

        setOrders(formattedOrders);
        setTotalOrders(recentOrders.length);

        // Thêm logic lấy danh sách đơn hàng bị hủy từ đoạn mã của bạn
        const response = await orderApi.getAll();
        if (!response.data || !response.data.result) {
          message.error("Không thể tải danh sách đơn hàng");
          setOrders([]);
          setCanceledOrders([]);
          return;
        }

        const orderDetails = response.data.result;
        const groupedOrders: { [key: string]: any } = {};
        orderDetails.forEach((detail: any) => {
          const orderId = detail.orderId._id;
          if (!groupedOrders[orderId]) {
            groupedOrders[orderId] = {
              orderId: orderId,
              orderDate: detail.orderId.order_date,
              status: detail.orderId.status,
              fullname: detail.orderId.userID?.fullname || "Không xác định",
              total_price: detail.orderId.total_price,
              products: [],
            };
          }
          groupedOrders[orderId].products.push({
            orderDetailId: detail._id,
            productId: detail.productId?._id || null,
            productName: detail.productId?.name || "Không xác định",
            productPrice: detail.product_price || 0,
            productImage: null,
            quantity: detail.quantity || 0,
            totalPrice: detail.total_price || 0,
          });
        });

        const formattedOrders: Order[] = Object.values(groupedOrders).map((order: any, index: number) => ({
          key: order.orderId || `order-${index}`,
          orderId: order.orderId || `ORDER${index}`,
          fullname: order.fullname,
          product: order.products.map((p: Product) => p.productName).join(", ") || "Không xác định",
          status: (order.status || "PENDING").toUpperCase() as Order["status"],
          quantity: order.products.reduce((sum: number, p: Product) => sum + p.quantity, 0) || 0,
          price: order.total_price?.toString() || "0",
          orderDate: order.orderDate ? moment(order.orderDate).format("DD/MM/YYYY HH:mm") : "Không xác định",
          products: order.products,
        }));

        const canceled = formattedOrders.filter((order) => order.status === "CANCELLED");
        setCanceledOrders(canceled);

        const outOfStockResponse = await productsApi.getProductOutStock();
        const outOfStockItems = outOfStockResponse.data.result || [];
        const formattedOutOfStockItems = outOfStockItems.map((product: any) => ({
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
        const formattedHotProducts = hotProductsItems.map((product: any) => ({
          key: product._id,
          _id: product._id,
          shortId: product._id ? `**${product._id.slice(-4)}` : "N/A",
          name: product.name,
          image: product.image_url?.[0] || "https://via.placeholder.com/64",
          images: product.image_url || [],
          quantity: product.quantity || 0,
          price: product.price,
          quantity_sold: product.quantity_sold || 0,
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
        message.error("Lỗi khi tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const ordersColumns = [
    {
      title: "ID đơn hàng",
      dataIndex: "shortId",
      key: "shortId",
      width: 80,
    },
    {
      title: "Khách hàng",
      dataIndex: "fullname",
      key: "fullname",
      width: 150,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 200,
    },
    {
      title: "Giao hàng",
      dataIndex: "delivery",
      key: "delivery",
      width: 200,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 100,
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: any, record: any) => (
        <Link to={`/order/${record.id}`}>
          <RightOutlined className="text-blue-500" />
        </Link>
      ),
    },
  ];

  // Sử dụng columns từ OrderList cho bảng "Đơn hàng hủy"
  const canceledOrdersColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => (
        <span className="text-[14px] font-normal text-gray-700">
          {text ? text.substring(0, 8) : "N/A"}...
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "fullname",
      key: "fullname",
      render: (text: string) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm text-blue-500">{text ? text.charAt(0).toUpperCase() : "?"}</span>
          </div>
          <span className="ml-3 text-[14px] font-normal text-gray-700">{text || "Không xác định"}</span>
        </div>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "product",
      key: "product",
      render: (text: string) => <span className="text-[14px] font-normal text-gray-700">{text}</span>,
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color="error" className="px-3 py-0.5 text-[13px] font-normal rounded-full">
          Đã hủy
        </Tag>
      ),
    },
  ];

  const productColumns = [
    {
      title: "Mã SP",
      dataIndex: "shortId",
      key: "shortId",
      width: 100,
    },
    { title: "Tên", dataIndex: "name", key: "name", width: 150 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (text) => (
        <img src={text || "https://via.placeholder.com/64"} alt="Product" className="object-cover w-16 h-16" />
      ),
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "quantity_sold",
      key: "quantity_sold",
      width: 100,
      render: (quantity_sold: number) => quantity_sold || 0,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price) => `${price?.toLocaleString() || 0} VNĐ`,
    },
    { title: "Danh mục", dataIndex: "category", key: "category", width: 100 },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand", width: 100 },
    {
      title: "Thẻ",
      dataIndex: "tag",
      key: "tag",
      width: 100,
      render: (tag) => (tag ? <Tag color="blue">{tag}</Tag> : "Không có"),
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
      render: (status) => <Text className="text-sm text-blue-600">{status || "Hoạt động"}</Text>,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link to="/admin/users">
                <Card bordered={false} className="shadow-sm">
                  <Statistic
                    title="Tổng số người dùng"
                    value={totalUsers}
                    prefix={<UserOutlined className="mr-2 text-xl text-cyan-500" />}
                    suffix="tài khoản"
                    loading={loading}
                  />
                </Card>
              </Link>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link to="/admin/products?status=out_of_stock">
                <Card bordered={false} className="shadow-sm">
                  <Statistic
                    title="Hết hàng"
                    value={outOfStockProducts.length}
                    prefix={<ExceptionOutlined className="mr-2 text-xl text-yellow-500" />}
                    suffix="sản phẩm"
                    loading={loading}
                  />
                </Card>
              </Link>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link to="/admin/bookings">
                <Card bordered={false} className="shadow-sm">
                  <Statistic
                    title="Tổng lịch hẹn"
                    value={totalAppointments}
                    prefix={<CalendarOutlined className="mr-2 text-xl text-green-500" />}
                    suffix="lịch hẹn"
                    loading={loading}
                  />
                </Card>
              </Link>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="ĐƠN HÀNG ĐANG CHỜ" bordered={false} className="shadow-sm">
              <div style={tableContainerStyle}>
                <Table
                  columns={ordersColumns}
                  dataSource={orders}
                  pagination={{
                    current: currentPageOrders,
                    pageSize: 4,
                    onChange: (page) => setCurrentPageOrders(page),
                    total: orders.length,
                  }}
                  className="overflow-x-auto"
                  loading={loading}
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="KHÁCH HÀNG THÂN THIẾT" bordered={false} className="shadow-sm">
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