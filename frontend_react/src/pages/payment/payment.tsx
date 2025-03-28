"use client";
import React, { useState, useEffect, Key } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";
import deliveryApi from "../../api/deliveryApi";
import paymentTypeApi from "../../api/paymentTypeApi";
import { clearProduct } from "../../redux/slices/cartslice";

// Định nghĩa interface cho phương thức thanh toán
interface PaymentType {
  _id: string;
  payment_type_name: string;
  description: string;
}

// Định nghĩa interface cho phương thức vận chuyển
interface Delivery {
  _id: string;
  delivery_name: string;
  description: string;
  delivery_fee: number;
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
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<Delivery | null>(null);

  // Định nghĩa kiểu cho paymentMethods và selectedPayment
  const [paymentMethods, setPaymentMethods] = useState<PaymentType[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>(""); // Sử dụng _id để xác định phương thức được chọn

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // Lấy dữ liệu giỏ hàng từ Redux store
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
  const { items: cartItems, userId } = useSelector((state: { cart: CartState }) => state.cart);

  // Hàm ánh xạ payment_type_name với icon
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

  // Kiểm tra token và khởi tạo dữ liệu khi component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

    if (token && accountID) {
      setIsLoggedIn(true);

      // Gọi API để lấy thông tin người dùng, bao gồm danh sách địa chỉ
      const fetchUserData = async () => {
        try {
          const userResponse = await userApi.getUserById(accountID);
          const userData: User = userResponse.data.data;
          const userAddresses: Address[] = userData.address || [];

          setAddresses(userAddresses);

          const defaultAddress = userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
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

      // Gọi API để lấy danh sách phương thức vận chuyển
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

      // Gọi API để lấy danh sách phương thức thanh toán
      const fetchPaymentMethods = async () => {
        try {
          const paymentResponse = await paymentTypeApi.getAllPayment();
          const paymentMethodsData: PaymentType[] = paymentResponse.data.data || [];
          setPaymentMethods(paymentMethodsData);

          // Chọn phương thức thanh toán mặc định (ví dụ: phương thức đầu tiên)
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

  const handleConfirmAddress = () => {
    const selected = addresses.find((address) => address._id === checkedAddressId);
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
    let total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (selectedShippingMethod) total += selectedShippingMethod.delivery_fee;
    return total;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const handleCheckout = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để tiến hành đặt hàng!");
      return;
    }
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    if (!selectedShippingMethod) {
      alert("Vui lòng chọn phương thức vận chuyển!");
      return;
    }

    try {
      const shippingAddress = formData.address;
      const orderData = {
        userID: userId,
        couponID: null,
        payment_typeID: selectedPayment,
        deliveryID: selectedShippingMethod,
        orderdate: new Date().toISOString(),
        total_price: calculateTotal(),
        shipping_address: shippingAddress,
        transaction_id: `TRANS_${Date.now()}`,
        orderDetails: cartItems.map((item) => ({
          productID: item.id,
          serviceID: null,
          quantity: item.quantity,
          product_price: item.price,
        })),
      };

      console.log("Cart items before order:", cartItems);
      console.log("Sending order data:", orderData);

      const response = await orderApi.create(orderData);
      console.log("Order created:", response);

      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(orderData);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      console.log("Orders in localStorage:", JSON.parse(localStorage.getItem("orders") || "[]"));

      setFormData({
        fullName: "",
        phone: "",
        address: "",
      });

      dispatch(clearProduct());

      alert("Đơn hàng của bạn đã được tạo thành công!");
      navigate("/");
    } catch (error) {
      console.error("Error creating order:", error);
      console.log("Error response:", error.response?.data);
      alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
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
                        <p className="font-medium text-lg">{selectedAddress.name}</p>
                        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                          | {selectedAddress.phone}
                        </p>
                        {selectedAddress.isDefault && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className={darkMode ? "text-gray-400" : "text-gray-600 mt-1"}>
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
                  {isLoggedIn ? "Chưa có địa chỉ nào. Vui lòng thêm địa chỉ." : "Vui lòng đăng nhập để xem địa chỉ."}
                </p>
              )}
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-full max-w-lg rounded-xl p-6 ${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Chọn địa chỉ giao hàng</h3>
                    <button onClick={() => setIsModalOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {addresses.length > 0 ? (
                      addresses.map((address: Address) => (
                        <motion.div
                          key={address._id || `${address.name}-${address.phone}`}
                          className={`p-4 mb-2 border-b ${
                            darkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <input
                              type="radio"
                              name="address"
                              checked={checkedAddressId === address._id}
                              onChange={() => setCheckedAddressId(address._id || null)}
                              className="h-4 w-4 text-blue-500 mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{address.name}</p>
                                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                                  | {address.phone}
                                </p>
                                {address.isDefault && (
                                  <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className={darkMode ? "text-gray-400" : "text-gray-600 mt-1"}>
                                {address.address}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">Chưa có địa chỉ nào.</p>
                    )}
                    <div className="flex justify-end mt-4">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmAddress}
                        className="rounded-xl bg-blue-500 px-4 py-1 font-medium text-white text-sm"
                      >
                        Xác nhận
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Shipping Method */}
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
                          <div className="font-medium">{method.delivery_name}</div>
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

            {/* Payment Method */}
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
                        <div className="font-medium">{method.payment_type_name}</div>
                        {method.description && (
                          <div className="text-sm text-gray-500">{method.description}</div>
                        )}
                      </div>
                      {selectedPayment === method._id && (
                        <CheckCircle size={18} className="ml-2 text-green-500" />
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

          {/* Order Summary */}
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
                    className={`flex-grow rounded-xl border p-3 ${
                      darkMode
                        ? "border-gray-700 bg-gray-700 text-white"
                        : "border-gray-300 bg-gray-50 text-gray-800"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white"
                  >
                    Áp dụng
                  </motion.button>
                </div>
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
                  <span className="text-gray-500">Chưa áp dụng</span>
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