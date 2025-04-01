"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Card, Tabs, Badge, Table, Tag, Button, Empty, Tooltip, Modal, message } from "antd";
import { FaUser, FaMoneyCheckAlt, FaEdit, FaShoppingBag, FaBox, FaTruck, FaCheck, FaTimes } from "react-icons/fa";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import Account from "../../components/account";
import Address from "../../components/address";
import ChangePassword from "../../components/change-password";
import { MdOutlineRoomService } from "react-icons/md";
import BookingHistory from "../../components/bookingHistory";

interface User {
  _id: string;
  email: string;
  fullname: string;
  password: string;
  phone_number: string;
  address: Address[];
  role: string;
  avatar: string;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  refreshToken: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Address {
  name: string;
  phone: string;
  address: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  weight: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
}

export default function UserProfile() {
  const params = useParams();
  const type = params["*"] || "account";
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample order data
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'PH2024001',
      date: '2024-01-20',
      status: 'pending',
      total: 100500,
      items: [
        {
          id: '1',
          name: 'ROYAL CANIN Mother & Babycat',
          quantity: 1,
          price: 100500,
          image: 'https://picsum.photos/200',
          weight: '2kg'
        }
      ],
      paymentMethod: 'COD',
      shippingAddress: '116 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1, TP HCM'
    },
    {
      id: '2',
      orderNumber: 'PH2024002',
      date: '2024-01-19',
      status: 'confirmed',
      total: 235000,
      items: [
        {
          id: '2',
          name: 'Premium Cat Food',
          quantity: 2,
          price: 117500,
          image: 'https://picsum.photos/200',
          weight: '1.5kg'
        }
      ],
      paymentMethod: 'Banking',
      shippingAddress: '116 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1, TP HCM'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

      if (!token || !accountID) {
        setUser(null);
        return;
      }

      try {
        const userResponse = await userApi.getUserById(accountID);
        setUser(userResponse.data.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(null);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    navigate("/userprofile/account");
  };

  const handleReorder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleViewDetails = (order: Order) => {
    // Logic để xem chi tiết đơn hàng
    console.log("Xem chi tiết đơn hàng:", order);
    // Ví dụ: Chuyển hướng đến trang chi tiết đơn hàng
    // navigate(`/order/${order.id}`);
  };

  const confirmReorder = async () => {
    setLoading(true);
    try {
      // Implement reorder logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Đơn hàng đã được đặt lại thành công!');
      setIsModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi đặt lại đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const OrderHistory = () => {
    const statusColors = {
      pending: 'blue',
      confirmed: 'green',
      shipping: 'orange',
      completed: 'green',
      cancelled: 'red',
    };

    const statusText = {
      pending: 'Chưa xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Vận chuyển',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    const columns = [
      {
        title: 'Mã đơn hàng',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        render: (text: string) => (
          <span className="font-medium text-gray-800">{text}</span>
        ),
      },
      {
        title: 'Sản phẩm',
        dataIndex: 'items',
        key: 'items',
        render: (items: OrderItem[]) => (
          <div className="flex items-center space-x-4">
            <img 
              src={items[0].image} 
              alt={items[0].name} 
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
            <div>
              <p className="font-medium text-gray-800">{items[0].name}</p>
              <p className="text-gray-500">
                {items[0].weight} x {items[0].quantity}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: 'Ngày đặt',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => (
          <span className="text-gray-600">
            {new Date(date).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'total',
        key: 'total',
        render: (total: number) => (
          <span className="text-blue-500 font-medium">
            {total.toLocaleString()}đ
          </span>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status: keyof typeof statusText) => (
          <Tag 
            color={statusColors[status]}
            className="flex items-center w-fit px-3 py-1"
          >
            {statusText[status]}
          </Tag>
        ),
      },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_: any, record: Order) => (
          <div className="space-x-2">
            <Button 
              type="primary"
              onClick={() => handleReorder(record)}
              className="bg-blue-500 hover:bg-blue-600 flex items-center"
              icon={<FaShoppingBag className="mr-2" />}
            >
              Mua lại
            </Button>
            {/* <Button 
              onClick={() => handleViewDetails(record)}
              className="text-gray-600 border-gray-300 hover:border-gray-400"
            >
              Chi tiết
            </Button> */}
          </div>
        ),
      },
    ];

    const items = [
      { label: 'Tất cả', key: 'all' },
      { label: 'Chưa xác nhận', key: 'pending' },
      { label: 'Đã xác nhận', key: 'confirmed' },
      { label: 'Vận chuyển', key: 'shipping' },
      { label: 'Hoàn thành', key: 'completed' },
      { label: 'Đã hủy', key: 'cancelled' },
    ];

    const filteredOrders = activeTab === 'all' 
      ? orders 
      : orders.filter(order => order.status === activeTab);

    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đơn mua</h2>
          <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          className="mb-4 custom-tabs"
        />

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 5,
            total: filteredOrders.length,
            showSizeChanger: false,
          }}
          className="border rounded-lg shadow-sm"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có đơn hàng nào"
              />
            ),
          }}
        />

        <Modal
          title="Xác nhận đặt lại đơn hàng"
          open={isModalVisible}
          onOk={confirmReorder}
          onCancel={() => setIsModalVisible(false)}
          confirmLoading={loading}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn đặt lại đơn hàng này?</p>
          {selectedOrder && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Chi tiết đơn hàng:</p>
              <p>Mã đơn hàng: {selectedOrder.orderNumber}</p>
              <p>Tổng tiền: {selectedOrder.total.toLocaleString()}đ</p>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  const renderSidebar = () => (
    <Card className="w-full md:w-1/4 border-none" styles={{ body: { padding: 0 } }}>
      <div className="mb-4 flex items-center gap-4">
        <Avatar size={75} src={user?.avatar || "/images/avatar/avatar1.png"} />
        <div>
          <h2 className="text-lg font-bold text-gray-800">{user?.fullname}</h2>
          <p
            className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:underline"
            onClick={handleEdit}
          >
            <FaEdit /> Sửa hồ sơ
          </p>
        </div>
      </div>
      <div className="space-y-2 text-lg text-gray-600">
        <div className="flex items-center gap-2">
          <FaUser className="text-[#22A6DF]" /> Tài khoản của tôi
        </div>
        <div
          className={`ml-7 cursor-pointer ${type === "account" ? "text-[#22A6DF]" : "text-gray-600"}`}
          onClick={() => navigate("/userprofile/account")}
        >
          Hồ sơ
        </div>
        <div
          className={`ml-7 cursor-pointer ${type === "address" ? "text-[#22A6DF]" : "text-gray-600"}`}
          onClick={() => navigate("/userprofile/address")}
        >
          Địa chỉ
        </div>
        <div
          className={`ml-7 cursor-pointer ${type === "change-password" ? "text-[#22A6DF]" : "text-gray-600"}`}
          onClick={() => navigate("/userprofile/change-password")}
        >
          Đổi mật khẩu
        </div>
        <div 
          className={`flex items-center gap-2 cursor-pointer ${type === "orders" ? "text-[#22A6DF]" : "text-gray-600"}`}
          onClick={() => navigate("/userprofile/orders")}
        >
          <FaMoneyCheckAlt className="text-[#22A6DF]" /> Đơn mua
        </div>

        <div
          className={`flex items-center gap-2 cursor-pointer ${
            type === "bookings" ? "text-[#22A6DF]" : "text-gray-600"
          }`}
          onClick={() => navigate("/userprofile/bookings")} 
        >
          <div className="flex items-center gap-2">
            <MdOutlineRoomService className="text-[#22A6DF]" /> Lịch đã đặt
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex my-6 flex-col gap-6 md:flex-row md:gap-8 sm:px-[40px] lg:px-[154px]">
      {renderSidebar()}
      <Card className="w-full md:w-3/4 rounded-lg border border-gray-200 shadow-md">
        <Routes>
          <Route path="account" element={<Account isEditing={isEditing} setIsEditing={setIsEditing} />} />
          <Route path="address" element={<Address />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="*" element={<div>Trang không tồn tại</div>} />
        </Routes>
      </Card>
    </div>
  );
}