"use client";
import React, { useState, useEffect, Key } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { usePayOS, PayOSConfig } from "payos-checkout";
import {
  Sun,
  Moon,
  ChevronRight,
  Package,
  CheckCircle,
  CreditCard,
  Truck,
  MapPin,
  DollarSign,
  X,
} from "lucide-react";
import { message } from "antd";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";
import deliveryApi from "../../api/deliveryApi";
import paymentTypeApi from "../../api/paymentTypeApi";
import couponApi from "../../api/couponApi";
import { clearProduct } from "../../redux/slices/cartslice";
import paymentApi from "../../api/paymentApi";
import ENV_VARS from "../../../config";

// Các interface giữ nguyên như cũ
interface PaymentType {
  _id: string;
  payment_type_name: string;
  description: string;
}

interface Delivery {
  _id: string;
  delivery_name: string;
  description: string;
  delivery_fee: number;
  status: string;
}

interface Coupon {
  _id: string;
  coupon_code: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  status: string;
}

interface Address {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

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

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [checkedAddressId, setCheckedAddressId] = useState<string | null>(null);

  const [shippingMethods, setShippingMethods] = useState<Delivery[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<Delivery | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentType[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  interface CartState {
    items: {
      id: number;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }[];
    userId: string | null;
  }
  const { items: cartItems, userId } = useSelector(
    (state: { cart: CartState }) => state.cart
  );

  const getPaymentIcon = (paymentTypeName: string) => {
    switch (paymentTypeName.toLowerCase()) {
      case "paypal":
        return <CreditCard className="text-blue-500" />;
      case "bank transfer":
      case "wire transfer":
        return <CreditCard className="text-green-500" />;
      case "cash on delivery":
        return <DollarSign className="text-blue-500" />;
      case "installment plan":
        return <CreditCard className="text-purple-500" />;
      case "gift card":
        return <CreditCard className="text-orange-500" />;
      default:
        return <CreditCard className="text-gray-500" />;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const accountID = localStorage
      .getItem("accountID")
      ?.replace(/"/g, "")
      .trim();

    if (token && accountID) {
      setIsLoggedIn(true);

      const fetchUserData = async () => {
        try {
          const userResponse = await userApi.getUserById(accountID);
          const userData: User = userResponse.data.data;
          const userAddresses: Address[] = userData.address || [];

          setAddresses(userAddresses);

          const defaultAddress =
            userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            setCheckedAddressId(defaultAddress._id || null);
            setFormData({
              fullName: defaultAddress.name,
              phone: defaultAddress.phone,
              address: defaultAddress.address,
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setAddresses([]);
          setSelectedAddress(null);
          setCheckedAddressId(null);
        }
      };

      const fetchDeliveryMethods = async () => {
        try {
          const deliveryResponse = await deliveryApi.getAllDelivery();
          const deliveryMethods: Delivery[] = deliveryResponse.data.data || [];
          setShippingMethods(deliveryMethods);

          if (deliveryMethods.length > 0) {
            setSelectedShippingMethod(deliveryMethods[0]);
          }
        } catch (error) {
          console.error("Failed to fetch delivery methods:", error);
          setShippingMethods([]);
          setSelectedShippingMethod(null);
        }
      };

      const fetchPaymentMethods = async () => {
        try {
          const paymentResponse = await paymentTypeApi.getAllPayment();
          const paymentMethodsData: PaymentType[] =
            paymentResponse.data.data || [];
          setPaymentMethods(paymentMethodsData);

          if (paymentMethodsData.length > 0) {
            setSelectedPayment(paymentMethodsData[0]._id);
          }
        } catch (error) {
          console.error("Failed to fetch payment methods:", error);
          setPaymentMethods([]);
          setSelectedPayment("");
        }
      };

      fetchUserData();
      fetchDeliveryMethods();
      fetchPaymentMethods();
    } else {
      setIsLoggedIn(false);
      setAddresses([]);
      setSelectedAddress(null);
      setCheckedAddressId(null);
      setShippingMethods([]);
      setSelectedShippingMethod(null);
      setPaymentMethods([]);
      setSelectedPayment("");
    }
  }, []);

  const applyCoupon = async () => {
    try {
      const response = await couponApi.getActiveCoupon();
      const activeCoupons: Coupon[] = response.data.result;

      const matchedCoupon = activeCoupons.find(
        (coupon) =>
          coupon.coupon_code.toUpperCase() === couponCode.toUpperCase()
      );

      if (!matchedCoupon) {
        message.error("Mã giảm giá không hợp lệ hoặc không tồn tại!");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      const currentDate = new Date();
      const startDate = new Date(matchedCoupon.start_date);
      const endDate = new Date(matchedCoupon.end_date);

      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (currentDate < startDate || currentDate > endDate) {
        message.error("Mã giảm giá đã hết hạn!");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      if (subtotal < matchedCoupon.min_order_value) {
        message.error(
          `Tổng tiền sản phẩm phải có giá trị tối thiểu ${matchedCoupon.min_order_value} để áp dụng mã này!`
        );
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      if (matchedCoupon.used_count >= matchedCoupon.usage_limit) {
        message.error("Mã giảm giá đã được sử dụng hết số lần cho phép!");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      const discountPercentage = matchedCoupon.discount_value;
      const discountValue = (subtotal * discountPercentage) / 100;

      setAppliedCoupon(matchedCoupon);
      setDiscount(discountValue);
      message.success(
        `Áp dụng mã giảm giá thành công! Bạn được giảm ${formatPrice(
          discountValue
        )}`
      );
    } catch (error) {
      console.error("Error applying coupon:", error);
      message.error("Có lỗi xảy ra khi áp dụng mã giảm giá. Vui lòng thử lại!");
      setAppliedCoupon(null);
      setDiscount(0);
    }
  };

  const handleConfirmAddress = () => {
    const selected = addresses.find(
      (address) => address._id === checkedAddressId
    );
    if (selected) {
      setSelectedAddress(selected);
      setFormData({
        fullName: selected.name,
        phone: selected.phone,
        address: selected.address,
      });
    }
    setIsModalOpen(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountedSubtotal = subtotal - discount;
    const total =
      discountedSubtotal +
      (selectedShippingMethod ? selectedShippingMethod.delivery_fee : 0);
    return Math.max(total, 0);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const handlePayment = async (paymentData: any) => {
    try {
      const response = await paymentApi.create({
        ...paymentData,
      });
      const checkoutUrl = response.data.checkoutUrl;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating payment link:", error);
      message.error("Có lỗi xảy ra khi tạo liên kết thanh toán.");
    }
  };

  const handleCheckout = async () => {
    try {
      if (!selectedAddress) {
        message.error("Vui lòng chọn địa chỉ giao hàng!");
        return;
      }
      if (!selectedShippingMethod) {
        message.error("Vui lòng chọn phương thức vận chuyển!");
        return;
      }
      if (!selectedPayment) {
        message.error("Vui lòng chọn phương thức thanh toán!");
        return;
      }
      if (cartItems.length === 0) {
        message.error("Giỏ hàng của bạn đang trống!");
        return;
      }

      message.loading("Đang xử lý đơn hàng...", 0);

      const shippingAddress = formData.address;
      const totalAmount = calculateTotal();

      // 1. Tạo dữ liệu đơn hàng (không có paymentOrderCode)
      const orderData = {
        userID: userId,
        couponID: appliedCoupon ? appliedCoupon._id : null,
        payment_typeID: selectedPayment,
        deliveryID: selectedShippingMethod?._id,
        orderdate: new Date().toISOString(),
        total_price: totalAmount,
        shipping_address: shippingAddress,
        transaction_id: `TRANS_${Date.now()}`, // Tạm thời dùng timestamp
        status: "PENDING",
        orderDetails: cartItems.map((item) => ({
          productID: item.id,
          serviceID: null,
          quantity: item.quantity,
          product_price: item.price,
        })),
      };

      console.log("Creating order with data:", orderData);

      // 2. Tạo đơn hàng
      const orderResponse = await orderApi.create(orderData);
      const createdOrder = orderResponse.data;
      console.log("Order created successfully:", createdOrder);

      // 3. Chuẩn bị dữ liệu thanh toán, sử dụng _id của đơn hàng
      const paymentData = {
        orderCode: createdOrder.order._id,
        amount: totalAmount,
        description: `Thanh toán đơn hàng ${createdOrder._id}`,
        returnUrl: `https://google.com/success`,
        cancelUrl: `https://youtube.com`,
      };

      console.warn("Creating payment with data:", paymentData);
      await handlePayment(paymentData);

      message.destroy();
    } catch (error) {
      console.error("Checkout process error:", error);
      message.destroy();
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleDarkMode}
        className={`fixed right-4 top-4 z-50 rounded-full p-2 shadow-lg ${
          darkMode ? "bg-gray-800 text-yellow-300" : "bg-white text-gray-800"
        }`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      <div className="container mx-auto px-[154px] py-8">
        <nav
          className={`mb-6 rounded-xl p-4 ${
            darkMode
              ? "bg-gray-800 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.05),inset_2px_2px_5px_rgba(0,0,0,0.3)]"
              : "bg-white shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.05)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={
                darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              Trang chủ
            </span>
            <ChevronRight
              size={16}
              className={darkMode ? "text-gray-600" : "text-gray-400"}
            />
            <span className={darkMode ? "text-white" : "text-gray-900"}>
              Thông tin giao hàng
            </span>
          </div>
        </nav>

        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 rounded-xl p-4 ${
              darkMode ? "bg-blue-900/30" : "bg-blue-50"
            }`}
          >
            <span>
              Bạn đã có tài khoản?{" "}
              <span className="ml-1 cursor-pointer font-bold text-blue-500 hover:text-blue-600">
                Đăng nhập
              </span>
            </span>
          </motion.div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-3/5"
          >
            <div
              className={`mb-8 rounded-xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="mb-6 text-xl font-semibold flex items-center">
                <MapPin className="mr-2" size={20} /> Thông tin giao hàng
              </h2>

              {isLoggedIn && selectedAddress ? (
                <div className="mb-4">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">
                          {selectedAddress.name}
                        </p>
                        <p
                          className={
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          | {selectedAddress.phone}
                        </p>
                        {selectedAddress.isDefault && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p
                        className={
                          darkMode ? "text-gray-400" : "text-gray-600 mt-1"
                        }
                      >
                        {selectedAddress.address}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-500 font-medium hover:text-blue-600"
                    >
                      Thay đổi
                    </motion.button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 mb-4">
                  {isLoggedIn
                    ? "Chưa có địa chỉ nào. Vui lòng thêm địa chỉ."
                    : "Vui lòng đăng nhập để xem địa chỉ."}
                </p>
              )}
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-full max-w-lg rounded-xl p-6 ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Chọn địa chỉ giao hàng
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {addresses.length > 0 ? (
                      addresses.map((address: Address) => (
                        <motion.div
                          key={
                            address._id || `${address.name}-${address.phone}`
                          }
                          className={`p-4 mb-2 border-b ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <input
                              type="radio"
                              name="address"
                              checked={checkedAddressId === address._id}
                              onChange={() =>
                                setCheckedAddressId(address._id || null)
                              }
                              className="h-4 w-4 text-blue-500 mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{address.name}</p>
                                <p
                                  className={
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  }
                                >
                                  | {address.phone}
                                </p>
                                {address.isDefault && (
                                  <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p
                                className={
                                  darkMode
                                    ? "text-gray-400"
                                    : "text-gray-600 mt-1"
                                }
                              >
                                {address.address}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        Chưa có địa chỉ nào.
                      </p>
                    )}
                    <div className="flex justify-end mt-4">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmAddress}
                        className="rounded-xl bg-blue-500 px-4 py- [=1 font-medium text-white text-sm"
                      >
                        Xác nhận
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            <div
              className={`mb-8 rounded-xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="mb-6 text-xl font-semibold flex items-center">
                <Truck className="mr-2" size={20} /> Phương thức vận chuyển
              </h2>
              {shippingMethods.length > 0 ? (
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={method._id}
                      onClick={() => setSelectedShippingMethod(method)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-4 ${
                        selectedShippingMethod?._id === method._id
                          ? darkMode
                            ? "border-blue-500 bg-blue-900/30"
                            : "border-blue-500 bg-blue-50"
                          : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`mr-3 rounded-full p-2 ${
                            darkMode ? "bg-gray-600" : "bg-white"
                          }`}
                        >
                          <Truck size={18} className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {method.delivery_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {method.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold">
                          {formatPrice(method.delivery_fee)}
                        </span>
                        {selectedShippingMethod?._id === method._id && (
                          <CheckCircle
                            size={18}
                            className="ml-2 text-green-500"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div
                  className={`flex h-40 flex-col items-center justify-center rounded-xl ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <Package
                    size={32}
                    className={darkMode ? "text-gray-500" : "text-gray-400"}
                  />
                  <p className="mt-3 text-center text-sm text-gray-500">
                    Không có phương thức vận chuyển khả dụng.
                  </p>
                </div>
              )}
            </div>

            <div
              className={`mb-8 rounded-xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="mb-6 text-xl font-semibold flex items-center">
                <CreditCard className="mr-2" size={20} /> Phương thức thanh toán
              </h2>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={method._id}
                      onClick={() => setSelectedPayment(method._id)}
                      className={`flex cursor-pointer items-center rounded-xl p-4 ${
                        selectedPayment === method._id
                          ? darkMode
                            ? "border-blue-500 bg-blue-900/30"
                            : "border-blue-500 bg-blue-50"
                          : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="mr-3">
                        <div
                          className={`rounded-full p-2 ${
                            darkMode ? "bg-gray-600" : "bg-white"
                          }`}
                        >
                          {getPaymentIcon(method.payment_type_name)}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">
                          {method.payment_type_name}
                        </div>
                        {method.description && (
                          <div className="text-sm text-gray-500">
                            {method.description}
                          </div>
                        )}
                      </div>
                      {selectedPayment === method._id && (
                        <CheckCircle
                          size={18}
                          className="ml-2 text-green-500"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div
                  className={`flex h-40 flex-col items-center justify-center rounded-xl ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <CreditCard
                    size={32}
                    className={darkMode ? "text-gray-500" : "text-gray-400"}
                  />
                  <p className="mt-3 text-center text-sm text-gray-500">
                    Không có phương thức thanh toán khả dụng.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/5"
          >
            <div
              className={`sticky top-8 rounded-xl p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="mb-6 text-xl font-semibold">Đơn hàng của bạn</h2>
              <div className="mb-6 border-b pb-6">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500">Giỏ hàng trống</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 mb-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p
                          className={
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }
                        >
                          Số lượng: {item.quantity}
                        </p>
                        <p className="mt-2 font-semibold text-blue-500">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`flex-grow rounded-xl border p-3 ${
                      darkMode
                        ? "border-gray-700 bg-gray-700 text-white"
                        : "border-gray-300 bg-gray-50 text-gray-800"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={applyCoupon}
                    className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white"
                  >
                    Áp dụng
                  </motion.button>
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-green-500">
                    Đã áp dụng mã {appliedCoupon.coupon_code}: Giảm{" "}
                    {formatPrice(discount)}
                  </p>
                )}
              </div>
              <div className="mb-6 space-y-3 border-b pb-6">
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                  >
                    Tạm tính
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      cartItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                  >
                    Phí vận chuyển
                  </span>
                  <span>
                    {selectedShippingMethod ? (
                      formatPrice(selectedShippingMethod.delivery_fee)
                    ) : (
                      <span className="text-gray-500">Đang tính...</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                  >
                    Giảm giá
                  </span>
                  <span className="text-green-500">
                    {discount > 0
                      ? `-${formatPrice(discount)}`
                      : "Chưa áp dụng"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-lg font-bold text-blue-500">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="mt-6 w-full rounded-xl bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600"
              >
                Hoàn tất đơn hàng
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
