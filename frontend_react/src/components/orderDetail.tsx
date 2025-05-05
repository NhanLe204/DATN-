"use client";
import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Empty, Modal, message, Tabs } from "antd";
import { FaShoppingBag, FaEye, FaStar } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import userApi from "../api/userApi";
import orderDetailApi from "../api/orderDetailApi";
import orderApi from "../api/orderApi";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartslice";
import ratingApi from "../api/ratingApi";
import paymentApi from "../api/paymentApi";
import ENV_VARS from "../../config";

interface User {
  _id: string;
  email: string;
  fullname: string;
  password: string;
  phone_number: string;
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

interface OrderItem {
  productId: any;
  orderDetailId: any;
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url: string[];
  isRated: boolean;
}

interface Order {
  id: string;
  orderDetailId: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
  deliveryFee: number;
  discountValue: number;
  payment_status: string;
  couponCode: string;
}

export default function OrderDetail() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isSelectProductModalVisible, setIsSelectProductModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [selectedProductForReview, setSelectedProductForReview] = useState<OrderItem | null>(null);
  const [orderDetailId, setOrderDetailId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

      if (!token || !accountID) {
        setUser(null);
        setFetchLoading(false);
        return;
      }

      try {
        const userResponse = await userApi.getUserById(accountID);
        setUser(userResponse.data.data);

        const orderResponse = await orderDetailApi.getOrderByUserId(accountID);
        if (!orderResponse.data.success) {
          setOrders([]);
        } else {
          setOrders(orderResponse.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setUser(null);
        setOrders([]);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReorder = (order: Order) => {
    const cartItems = order.items.map((item) => ({
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image_url[0],
      },
      quantity: item.quantity,
    }));

    cartItems.forEach((cartItem) => {
      dispatch(addToCart(cartItem));
    });

    navigate("/checkout", {
      state: {
        reorderItems: cartItems,
        shippingAddress: order.shippingAddress,
        paymentMethodId: order.paymentMethod,
      },
    });
  };

  const confirmReorder = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Đơn hàng đã được đặt lại thành công!");
      setIsModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra khi đặt lại đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowReviewModal = (order: Order, productId: string) => {
    const product = order.items.find((item) => item.id === productId);
    if (product && !product.isRated) {
      setOrderDetailId(product.orderDetailId);
      setSelectedProductForReview(product);
      setIsReviewModalVisible(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProductForReview || !orderDetailId) {
      message.error("Không tìm thấy sản phẩm hoặc đơn hàng để đánh giá.");
      return;
    }

    if (!comment.trim()) {
      message.error("Vui lòng nhập nhận xét để gửi đánh giá.");
      return;
    }

    setReviewLoading(true);

    try {
      const reviewData = {
        orderDetailId: orderDetailId,
        score: rating,
        content: comment.trim(),
      };

      const response = await ratingApi.createRating(reviewData);
      const responseData = response.data;

      if (responseData) {
        message.success("Đánh giá sản phẩm thành công!");
        setIsReviewModalVisible(false);
        setRating(5);
        setComment("");
        setSelectedProductForReview(null);
        setOrderDetailId(null);

        setOrders((prevOrders) =>
          prevOrders.map((order) => ({
            ...order,
            items: order.items.map((item) =>
              item.orderDetailId === orderDetailId
                ? { ...item, isRated: true }
                : item
            ),
          }))
        );
      } else {
        message.error("Không thể gửi đánh giá. Vui lòng thử lại.");
      }
    } catch (error: any) {
      message.error("Lỗi hệ thống, vui lòng thử lại.");
    } finally {
      setReviewLoading(false);
    }
  };

  const confirmSubmitReview = () => {
    Modal.confirm({
      title: "Xác nhận gửi đánh giá",
      content: "Bạn có chắc chắn muốn gửi đánh giá này?",
      onOk: handleSubmitReview,
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setLoading(true);
    try {
      const response = await orderApi.updateOrderStatus(orderToCancel.id, "CANCELLED");
      if (response.success) {
        const updatedOrders = orders.map((o) =>
          o.id === orderToCancel.id ? { ...o, status: "CANCELLED" } : o
        );
        setOrders(updatedOrders);
        message.success("Đơn hàng đã được hủy thành công!");
        setIsCancelModalVisible(false);
      } else {
        message.error("Hủy đơn hàng thất bại: " + response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi hủy đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const showCancelConfirm = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelModalVisible(true);
  };

  const statusColors = {
    PENDING: "blue",
    PROCESSING: "green",
    SHIPPING: "orange",
    SHIPPED: "orange",
    DELIVERED: "green",
    CANCELLED: "red",
  };

  const statusText = {
    PENDING: "Chưa xác nhận",
    PROCESSING: "Đã xác nhận",
    SHIPPING: "Đang vận chuyển",
    SHIPPED: "Đã vận chuyển",
    DELIVERED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  const handlePayment = async (id: string, total: number) => {
    try {
      const paymentData = {
        orderId: id,
        amount: total,
        description: `Thanh toán đơn hàng ${id}`,
        returnUrl: `${ENV_VARS.VITE_VNPAY_URL}/success`,
        cancelUrl: `${ENV_VARS.VITE_VNPAY_URL}/cancel`,
      };

      const response = await paymentApi.create(paymentData);
      const checkoutUrl = response.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        message.error("Không thể tạo liên kết thanh toán.");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo liên kết thanh toán.");
    }
  };

  const paymentStatusColors = {
    PENDING: "blue",
    PAID: "green",
    CASH_ON_DELIVERY: "orange",
  };

  const paymentStatusText = {
    PENDING: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    CASH_ON_DELIVERY: "Thanh toán khi nhận hàng",
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: "10%",
      render: (_: any, __: any, index: number) => (
        <span className="font-medium text-gray-800 text-xs">{index + 1}</span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      width: "30%",
      render: (items: OrderItem[], record: Order) => {
        const maxItemsToShow = 1;
        const displayedItems = items.slice(0, maxItemsToShow);
        const remainingItems = items.length - maxItemsToShow;

        return (
          <div className="flex flex-col space-y-1">
            {displayedItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <img
                  src={`${item.image_url[0]}`}
                  alt={item.name}
                  className="w-6 h-6 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-xs break-words line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-gray-500 text-xs">SL: {item.quantity}</p>
                </div>
              </div>
            ))}
            {remainingItems > 0 && (
              <Button
                type="link"
                onClick={() => handleViewDetails(record)}
                className="text-blue-500 p-0 text-xs"
              >
                +{remainingItems} sản phẩm
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      width: "15%",
      render: (date: string) => (
        <span className="text-gray-600 text-xs whitespace-nowrap">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: "15%",
      render: (total: number) => (
        <span className="text-blue-500 font-medium text-xs whitespace-nowrap">
          {total.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status: keyof typeof statusText) => (
        <Tag
          color={statusColors[status]}
          className="flex items-center w-fit px-1 py-0.5 text-xs"
        >
          <span className="break-words line-clamp-1">{statusText[status]}</span>
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      width: "15%",
      render: (payment_status: keyof typeof paymentStatusText, record: Order) => (
        <Tag
          onClick={() =>
            payment_status === "PENDING" &&
            handlePayment(record.id, record.total)
          }
          color={paymentStatusColors[payment_status]}
          className={`flex items-center w-fit px-1 py-0.5 text-xs ${
            payment_status === "PENDING" ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          <span className="break-words line-clamp-1">{paymentStatusText[payment_status]}</span>
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_: any, record: Order) => (
        <div className="flex flex-col space-y-1">
          <Button
            type="primary"
            onClick={() => handleViewDetails(record)}
            className="bg-green-500 hover:bg-green-600 flex items-center justify-center text-xs w-full p-1"
            icon={<FaEye className="mr-0.5" />}
          >
            Xem
          </Button>
          {record.status === "DELIVERED" && (
            <>
              <Button
                type="primary"
                onClick={() => handleReorder(record)}
                className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-xs w-full p-1"
                icon={<FaShoppingBag className="mr-0.5" />}
              >
                Mua
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setSelectedOrderForReview(record);
                  setIsSelectProductModalVisible(true);
                }}
                className="bg-purple-500 hover:bg-purple-600 flex items-center justify-center text-xs w-full p-1"
                icon={<FaStar className="mr-0.5 text-yellow-400" />}
              >
                Đánh giá
              </Button>
            </>
          )}
          {record.status === "PENDING" && (
            <Button
              danger
              onClick={() => showCancelConfirm(record)}
              className="flex items-center justify-center text-xs w-full p-1"
              icon={<MdCancel className="mr-0.5" />}
            >
              Hủy
            </Button>
          )}
        </div>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: "15%",
      render: (image_url: string[]) => (
        <img
          src={image_url[0]}
          alt="Sản phẩm"
          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: "35%", // Adjusted to accommodate new column
      render: (text: string) => (
        <span className="font-medium text-gray-800 text-sm break-words line-clamp-1">{text}</span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
      render: (quantity: number) => <span className="text-sm">{quantity}</span>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "15%", // Adjusted to fit new column
      render: (price: number) => (
        <span className="text-sm whitespace-nowrap">{price.toLocaleString()}đ</span>
      ),
    },
    {
      title: "Tổng cộng",
      key: "total",
      width: "20%", // New column for total price per item
      render: (record: OrderItem) => (
        <span className="text-sm whitespace-nowrap">
          {(record.quantity * record.price).toLocaleString()}đ
        </span>
      ),
    },
  ];

  const items = [
    { label: "Tất cả", key: "ALL" },
    { label: "Chưa xác nhận", key: "PENDING" },
    { label: "Đã xác nhận", key: "PROCESSING" },
    { label: "Đang vận chuyển", key: "SHIPPING" },
    { label: "Đã vận chuyển", key: "SHIPPED" },
    { label: "Hoàn thành", key: "DELIVERED" },
    { label: "Đã hủy", key: "CANCELLED" },
  ];

  const filteredOrders = Array.isArray(orders)
    ? activeTab === items[0].key
      ? orders
      : orders.filter((order) => order.status === activeTab)
    : [];

  const subTotal = (items: OrderItem[]): number => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  return (
    <div className="w-full p-1 sm:p-2 lg:p-4 max-w-[100vw] overflow-x-hidden">
      <div className="mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
          Đơn mua sản phẩm
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
          Quản lý các đơn hàng sản phẩm của bạn
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        className="mb-2 sm:mb-4"
        tabBarStyle={{ overflowX: "auto", whiteSpace: "nowrap", fontSize: "10px sm:12px lg:14px" }}
      />

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={fetchLoading}
        pagination={{
          pageSize: 5,
          total: filteredOrders.length,
          showSizeChanger: false,
          responsive: true,
        }}
        className="border rounded-lg shadow-sm"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có đơn hàng sản phẩm nào"
            />
          ),
        }}
        scroll={{ x: false }}
      />

      <Modal
        title="Xác nhận đặt lại đơn hàng"
        open={isModalVisible}
        onOk={confirmReorder}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
        width="90%"
        style={{ maxWidth: "320px" }}
      >
        <p className="text-xs sm:text-sm">
          Bạn có chắc chắn muốn đặt lại đơn hàng này?
        </p>
        {selectedOrder && (
          <div className="mt-1 sm:mt-2 p-1 sm:p-2 bg-gray-50 rounded-lg">
            <p className="font-medium text-xs sm:text-sm">Chi tiết đơn hàng:</p>
            <p className="text-xs sm:text-sm">Mã đơn hàng: {selectedOrder.orderNumber}</p>
            <p className="text-xs sm:text-sm">
              Tổng tiền: {selectedOrder.total.toLocaleString()}đ
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isCancelModalVisible}
        onOk={handleCancelOrder}
        onCancel={() => setIsCancelModalVisible(false)}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true }}
        width="90%"
        style={{ maxWidth: "320px" }}
      >
        <p className="text-xs sm:text-sm">
          Bạn có chắc chắn muốn hủy đơn hàng này không?
        </p>
        {orderToCancel && (
          <div className="mt-1 sm:mt-2 p-1 sm:p-2 bg-gray-50 rounded-lg">
            <p className="font-medium text-xs sm:text-sm">Chi tiết đơn hàng:</p>
            <p className="text-xs sm:text-sm">Mã đơn hàng: {orderToCancel.orderNumber}</p>
            <p className="text-xs sm:text-sm">
              Tổng tiền: {orderToCancel.total.toLocaleString()}đ
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="Chi tiết đơn hàng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[

        ]}
        width="90%"
        style={{ maxWidth: "600px" }}
      >
        {selectedOrder && (
          <div className="p-2 sm:p-4">
            <div className="space-y-4">
              {/* Order Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-semibold">Mã đơn hàng:</p>
                  <p>{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="font-semibold">Địa chỉ giao hàng:</p>
                  <p className="break-words">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <p className="font-semibold">Phương thức thanh toán:</p>
                  <p>{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="font-semibold">Tổng tiền sản phẩm:</p>
                  <p>{subTotal(selectedOrder.items).toLocaleString()}đ</p>
                </div>
                <div>
                  <p className="font-semibold">Phí vận chuyển:</p>
                  <p>{selectedOrder.deliveryFee === 0 ? "Miễn phí" : `${selectedOrder.deliveryFee.toLocaleString()}đ`}</p>
                </div>
                <div>
                  <p className="font-semibold">Ngày đặt:</p>
                  <p>{new Date(selectedOrder.date).toLocaleDateString("vi-VN")}</p>
                </div>
                <div>
                  <p className="font-semibold">Trạng thái:</p>
                  <p>{statusText[selectedOrder.status]}</p>
                </div>
                <div>
                  <p className="font-semibold">Tổng tiền:</p>
                  <p className="text-blue-500 font-semibold">{selectedOrder.total.toLocaleString()}đ</p>
                </div>
              </div>

              {/* Product List */}
              <div className="mt-4">
                <h3 className="font-medium text-base mb-2">Sản phẩm trong đơn hàng:</h3>
                <Table
                  columns={itemColumns}
                  dataSource={selectedOrder.items}
                  rowKey="id"
                  pagination={false}
                  className="border rounded-lg"
                  scroll={{ x: false }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Đánh giá sản phẩm"
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: "340px" }}
      >
        {selectedProductForReview && (
          <div className="p-1 sm:p-2 lg:p-6">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 mb-2 sm:mb-4">
              <img
                src={selectedProductForReview.image_url[0]}
                alt={selectedProductForReview.name}
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 object-cover rounded-lg border border-gray-200 mb-1 sm:mb-0"
              />
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-xs sm:text-base lg:text-lg break-words line-clamp-1">
                  {selectedProductForReview.name}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
                  Giá: {selectedProductForReview.price.toLocaleString()}đ
                </p>
              </div>
            </div>

            <div className="mb-2 sm:mb-4">
              <p className="font-medium mb-1 sm:mb-1 text-xs sm:text-sm lg:text-base">
                Đánh giá của bạn
              </p>
              <div className="flex space-x-0.5 sm:space-x-1">
                {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-lg sm:text-xl lg:text-2xl focus:outline-none transition-colors ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 sm:mb-4">
              <p className="font-medium mb-1 sm:mb-1 text-xs sm:text-sm lg:text-base">
                Nhận xét của bạn
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-1 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm lg:text-base"
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
            </div>

            <div className="flex justify-end space-x-1 sm:space-x-2">
              <Button
                onClick={() => setIsReviewModalVisible(false)}
                size="small"
                className="text-xs sm:text-sm"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={confirmSubmitReview}
                loading={reviewLoading}
                className="bg-purple-500 hover:bg-purple-600 text-xs sm:text-sm"
                size="small"
              >
                Gửi đánh giá
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Chọn sản phẩm để đánh giá"
        open={isSelectProductModalVisible}
        onCancel={() => setIsSelectProductModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: "340px" }}
      >
        {selectedOrderForReview && (
          <div className="p-1 sm:p-2 lg:p-6">
            {selectedOrderForReview.items.length === 0 ? (
              <p className="text-xs sm:text-sm lg:text-base">
                Không có sản phẩm nào để đánh giá.
              </p>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {selectedOrderForReview.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center justify-between p-1 sm:p-2 border rounded-lg bg-white"
                  >
                    <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 w-full">
                      <img
                        src={item.image_url[0]}
                        alt={item.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg border border-gray-200 mb-1 sm:mb-0"
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-medium text-gray-800 text-xs sm:text-sm break-words line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          Giá: {item.price.toLocaleString()}đ
                        </p>
                        {item.isRated && (
                          <div className="flex justify-center sm:justify-start items-center space-x-0.5 sm:space-x-1 mt-0.5 sm:mt-1">
                            <p className="text-gray-400 text-xs sm:text-sm">Đã đánh giá</p>
                            <Button
                              type="link"
                              onClick={() => navigate(`/detail/${item.productId}#reviews`)}
                              className="text-blue-500 p-0 text-xs sm:text-sm"
                            >
                              Xem đánh giá
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!item.isRated && (
                      <Button
                        type="primary"
                        onClick={() => {
                          setOrderDetailId(item.orderDetailId);
                          setSelectedProductForReview(item);
                          setIsSelectProductModalVisible(false);
                          setIsReviewModalVisible(true);
                        }}
                        className="bg-purple-500 hover:bg-purple-600 mt-1 sm:mt-0 w-full sm:w-auto text-xs sm:text-sm"
                        size="small"
                      >
                        Chọn
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}