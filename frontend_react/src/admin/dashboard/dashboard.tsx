import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Tag, 
  Statistic
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  TagsOutlined,
  ExceptionOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
const { Title, Text } = Typography;


const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const today = new Date();
      const weekday = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const day = weekday[today.getDay()];
      
      let dd = today.getDate().toString();
      let mm = (today.getMonth() + 1).toString();
      const yyyy = today.getFullYear();
      const h = today.getHours();
      const m = today.getMinutes().toString().padStart(2, '0');
      const s = today.getSeconds().toString().padStart(2, '0');
      
      if (parseInt(dd) < 10) dd = '0' + dd;
      if (parseInt(mm) < 10) mm = '0' + mm;
      
      const dateStr = `${day}, ${dd}/${mm}/${yyyy}`;
      const timeStr = `${h} giờ ${m} phút ${s} giây`;
      
      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    
    return () => clearInterval(timerId);
  }, []);

  // Chart data
  const salesData = [
    { name: 'Tháng 1', sales2023: 20, sales2022: 48 },
    { name: 'Tháng 2', sales2023: 59, sales2022: 48 },
    { name: 'Tháng 3', sales2023: 90, sales2022: 49 },
    { name: 'Tháng 4', sales2023: 51, sales2022: 39 },
    { name: 'Tháng 5', sales2023: 56, sales2022: 86 },
    { name: 'Tháng 6', sales2023: 100, sales2022: 10 },
  ];

  // Table data
  const topProductsColumns = [
    { title: 'Mã sản phẩm', dataIndex: 'id', key: 'id' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Giá tiền', dataIndex: 'price', key: 'price' },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
  ];

  const topProductsData = [
    { key: '1', id: '71309005', name: 'Cát vệ sinh cho mèo', price: '240.000 VNĐ', category: 'Sức khỏe - vệ sinh' },
    { key: '2', id: '62304003', name: 'Hạt thức ăn cho chó', price: '220.000 VNĐ', category: 'Thức ăn cho chó' },
  ];

  const ordersColumns = [
    { title: 'ID đơn hàng', dataIndex: 'id', key: 'id' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Đơn hàng', dataIndex: 'products', key: 'products' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total' },
  ];

  const ordersData = [
    { 
      key: '1', 
      id: 'MD0837', 
      customer: 'Thai Thuan', 
      products: 'Cát vệ sinh cho mèo, Hạt thức ăn cho mèo', 
      quantity: '2 sản phẩm', 
      total: '350.000 VNĐ' 
    },
    { 
      key: '2', 
      id: 'MĐ8265', 
      customer: '7 seo', 
      products: 'Bánh thưởng cho chó làm sạch răng', 
      quantity: '1 sản phẩm', 
      total: '50.000 VNĐ' 
    },
  ];

  const outOfStockColumns = [
    { title: 'Mã sản phẩm', dataIndex: 'id', key: 'id' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { 
      title: 'Ảnh', 
      dataIndex: 'image', 
      key: 'image',
      render: (text: string) => <img src={text} alt="Product" className="w-16 h-16 object-cover" />
    },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { 
      title: 'Tình trạng', 
      dataIndex: 'status', 
      key: 'status',
      render: () => <Tag color="error">Hết hàng</Tag>
    },
    { title: 'Giá tiền', dataIndex: 'price', key: 'price' },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
  ];

  const outOfStockData = [
    { 
      key: '1', 
      id: '83826226', 
      name: 'Túi đựng chó mèo 40cm', 
      image: 'https://www.petmart.vn/wp-content/uploads/2019/05/tui-dung-cho-meo-anime-nhieu-mau-sac-khong-hoa-tiet.jpg', 
      quantity: '0', 
      status: 'Hết hàng', 
      price: '170.000 VNĐ', 
      category: 'Phụ kiện' 
    },
  ];

  const newCustomers = [
    { name: 'ThaiThuan', status: 'Đang truy cập', avatar: 'https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png' },
    { name: '7seo', status: 'Đang truy cập', avatar: 'https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Tổng Nhân viên"
                  value={5}
                  prefix={<UserOutlined className="text-blue-500 text-xl mr-2" />}
                  suffix="nhân viên"
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
                  title="Tổng số người dùng"
                  value={5}
                  prefix={<TagsOutlined className="text-cyan-500 text-xl mr-2" />}
                  suffix="tài khoản"
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
                  value={457}
                  prefix={<ShoppingCartOutlined className="text-yellow-500 text-xl mr-2" />}
                  suffix="đơn hàng"
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
                  title="Tổng thu nhập"
                  value="400.000"
                  prefix={<BarChartOutlined className="text-blue-500 text-xl mr-2" />}
                  suffix="VNĐ"
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
                  value={1}
                  prefix={<ExceptionOutlined className="text-yellow-500 text-xl mr-2" />}
                  suffix="sản phẩm"
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
                  value={2}
                  prefix={<FileTextOutlined className="text-red-500 text-xl mr-2" />}
                  suffix="đơn hàng"
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card 
              title="THỐNG KÊ DOANH SỐ" 
              bordered={false}
              className="shadow-sm"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales2023" name="Doanh số 2023" fill="#FFD43B" />
                    <Bar dataKey="sales2022" name="Doanh số 2022" fill="#096DEF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card 
              title="Khách hàng mới" 
              bordered={false}
              className="shadow-sm"
            >
              <div className="space-y-4">
                {newCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={customer.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                      <div>
                        <Text type="secondary" className="text-sm text-gray-500">{customer.name}</Text>
                        <br />
                        <Text className="text-xs text-blue-600">{customer.status}</Text>
                      </div>
                    </div>
                    <Button type="primary" size="small">Xem chi tiết</Button>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <Card 
          title="SẢN PHẨM BÁN CHẠY" 
          bordered={false}
          className="shadow-sm mb-6"
        >
          <Table 
            columns={topProductsColumns} 
            dataSource={topProductsData} 
            pagination={false}
            className="overflow-x-auto"
          />
        </Card>

        <Card 
          title="TỔNG ĐƠN HÀNG" 
          bordered={false}
          className="shadow-sm mb-6"
        >
          <Table 
            columns={ordersColumns} 
            dataSource={ordersData} 
            pagination={false}
            className="overflow-x-auto"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Title level={5} className="m-0">Tổng cộng:</Title>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Title level={5} className="m-0">400.000 VNĐ</Title>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        <Card 
          title="SẢN PHẨM ĐÃ HẾT" 
          bordered={false}
          className="shadow-sm"
        >
          <Table 
            columns={outOfStockColumns} 
            dataSource={outOfStockData} 
            pagination={false}
            className="overflow-x-auto"
          />
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;