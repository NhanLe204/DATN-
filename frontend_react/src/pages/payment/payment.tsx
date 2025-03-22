"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  Package,
  CheckCircle,
  CreditCard,
  Truck,
  MapPin,
  DollarSign,
} from "lucide-react";

const Payment = () => {
  const [darkMode, setDarkMode] = useState(false);
  interface Province {
    code: Key | null | undefined;
    packge: string;
    name: string;
  }
  const [provinces, setProvinces] = useState<Province[]>([]);
  interface District {
    code: string;
    name: string;
  }
  const [districts, setDistricts] = useState<District[]>([]);
  interface Ward {
    code: string;
    name: string;
  }
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  interface ShippingMethod {
    id: number;
    name: string;
    price: number;
    days: string;
  }
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [selectedPayment, setSelectedPayment] = useState("cod");

  // Lấy dữ liệu giỏ hàng từ Redux store
  interface CartState {
    items: { id: number; name: string; price: number; quantity: number; image: string }[];
    userId: string | null;
  }
  const { items: cartItems, userId } = useSelector((state: { cart: CartState }) => state.cart);

  // Payment methods data
  const paymentMethods = [
    { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: <DollarSign className="text-blue-500" /> },
    { id: "bank_transfer", label: "Chuyển khoản qua ngân hàng", icon: <CreditCard className="text-green-500" /> },
    { id: "card", label: "Thanh toán qua thẻ ngân hàng", icon: <CreditCard className="text-purple-500" /> },
  ];

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province is selected
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`);
          const data = await response.json();
          setDistricts(data.districts || []);
          setSelectedDistrict(null);
          setWards([]);
          setSelectedWard(null);
          setShippingMethods([
            { id: 1, name: "Giao hàng tiêu chuẩn", price: 25000, days: "2-3" },
            { id: 2, name: "Giao hàng nhanh", price: 45000, days: "1-2" },
          ]);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      setShippingMethods([]);
    }
  }, [selectedProvince]);

  // Fetch wards when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`);
          const data = await response.json();
          setWards(data.wards || []);
          setSelectedWard(null);
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      };
      fetchWards();
    } else {
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedDistrict]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const calculateTotal = () => {
    let total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (selectedShippingMethod) total += selectedShippingMethod.price;
    return total;
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const handleCheckout = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để tiến hành đặt hàng!");
      return;
    }
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !selectedProvince || !selectedDistrict || !selectedWard || !selectedShippingMethod) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng và chọn phương thức vận chuyển!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    try {
      const shippingAddress = `${formData.address}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
      const orderData = {
        userID: userId,
        payment_typeID: selectedPayment,
        deliveryID: selectedShippingMethod.id,
        couponID: null,
        orderdate: new Date().toISOString(),
        total_price: calculateTotal(),
        shipping_address: shippingAddress,
        payment_status: selectedPayment === "cod" ? "pending" : "completed",
        transaction_id: `TRANS_${Date.now()}`,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      console.log("Order created:", response.data);

      // Lưu đơn hàng vào localStorage
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(orderData);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      alert("Đơn hàng của bạn đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
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
            <span className={darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}>Trang chủ</span>
            <ChevronRight size={16} className={darkMode ? "text-gray-600" : "text-gray-400"} />
            <span className={darkMode ? "text-white" : "text-gray-900"}>Thông tin giao hàng</span>
          </div>
        </nav>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 rounded-xl p-4 ${darkMode ? "bg-blue-900/30" : "bg-blue-50"}`}>
          <span>
            Bạn đã có tài khoản?{" "}
            <span className="ml-1 cursor-pointer font-bold text-blue-500 hover:text-blue-600">Đăng nhập</span>
          </span>
        </motion.div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-3/5">
            <div className={`mb-8 rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="mb-6 text-xl font-semibold flex items-center">
                <MapPin className="mr-2" size={20} /> Thông tin giao hàng
              </h2>
              <div className="mb-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Họ và tên"
                  className={`w-full rounded-xl border p-3 ${darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                />
              </div>
              <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className={`w-full rounded-xl border p-3 ${darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại"
                  className={`w-full rounded-xl border p-3 ${darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ"
                  className={`w-full rounded-xl border p-3 ${darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="relative">
                  <div
                    onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                  >
                    <span className={selectedProvince ? "" : "text-gray-400"}>
                      {selectedProvince ? selectedProvince.name : "Chọn tỉnh/thành phố"}
                    </span>
                    <ChevronDown size={16} />
                  </div>
                  {showProvinceDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-800"}`}
                    >
                      {provinces.map((province) => (
                        <div
                          key={province.code}
                          onClick={() => {
                            setSelectedProvince(province);
                            setShowProvinceDropdown(false);
                          }}
                          className={`cursor-pointer p-3 hover:bg-blue-100 hover:text-blue-600 ${darkMode ? "hover:bg-blue-900" : ""}`}
                        >
                          {province.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
                <div className="relative">
                  <div
                    onClick={() => selectedProvince && setShowDistrictDropdown(!showDistrictDropdown)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${!selectedProvince ? (darkMode ? "border-gray-700 bg-gray-700 opacity-50" : "border-gray-200 bg-gray-100 opacity-50") : darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                  >
                    <span className={selectedDistrict ? "" : "text-gray-400"}>
                      {selectedDistrict ? selectedDistrict.name : "Chọn quận/huyện"}
                    </span>
                    <ChevronDown size={16} />
                  </div>
                  {showDistrictDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-800"}`}
                    >
                      {districts.map((district) => (
                        <div
                          key={district.code}
                          onClick={() => {
                            setSelectedDistrict(district);
                            setShowDistrictDropdown(false);
                          }}
                          className={`cursor-pointer p-3 hover:bg-blue-100 hover:text-blue-600 ${darkMode ? "hover:bg-blue-900" : ""}`}
                        >
                          {district.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
                <div className="relative">
                  <div
                    onClick={() => selectedDistrict && setShowWardDropdown(!showWardDropdown)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${!selectedDistrict ? (darkMode ? "border-gray-700 bg-gray-700 opacity-50" : "border-gray-200 bg-gray-100 opacity-50") : darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                  >
                    <span className={selectedWard ? "" : "text-gray-400"}>
                      {selectedWard ? selectedWard.name : "Chọn phường/xã"}
                    </span>
                    <ChevronDown size={16} />
                  </div>
                  {showWardDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-800"}`}
                    >
                      {wards.map((ward) => (
                        <div
                          key={ward.code}
                          onClick={() => {
                            setSelectedWard(ward);
                            setShowWardDropdown(false);
                          }}
                          className={`cursor-pointer p-3 hover:bg-blue-100 hover:text-blue-600 ${darkMode ? "hover:bg-blue-900" : ""}`}
                        >
                          {ward.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className={`mb-8 rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="mb-6 text-xl font-semibold flex items-center">
                <Truck className="mr-2" size={20} /> Phương thức vận chuyển
              </h2>
              {selectedProvince && selectedDistrict && selectedWard ? (
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={method.id}
                      onClick={() => setSelectedShippingMethod(method)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-4 ${selectedShippingMethod?.id === method.id ? (darkMode ? "border-blue-500 bg-blue-900/30" : "border-blue-500 bg-blue-50") : darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center">
                        <div className={`mr-3 rounded-full p-2 ${darkMode ? "bg-gray-600" : "bg-white"}`}>
                          <Truck size={18} className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-500">Nhận hàng trong {method.days} ngày</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold">{formatPrice(method.price)}</span>
                        {selectedShippingMethod?.id === method.id && <CheckCircle size={18} className="ml-2 text-green-500" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`flex h-40 flex-col items-center justify-center rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <Package size={32} className={darkMode ? "text-gray-500" : "text-gray-400"} />
                  <p className="mt-3 text-center text-sm text-gray-500">Vui lòng chọn tỉnh/thành, quận/huyện và phường/xã để xem phương thức vận chuyển</p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className={`mb-8 rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="mb-6 text-xl font-semibold flex items-center">
                <CreditCard className="mr-2" size={20} /> Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex cursor-pointer items-center rounded-xl p-4 ${selectedPayment === method.id ? (darkMode ? "border-blue-500 bg-blue-900/30" : "border-blue-500 bg-blue-50") : darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <div className="mr-3">
                      <div className={`rounded-full p-2 ${darkMode ? "bg-gray-600" : "bg-white"}`}>{method.icon}</div>
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{method.label}</div>
                    </div>
                    {selectedPayment === method.id && <CheckCircle size={18} className="ml-2 text-green-500" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-2/5">
            <div className={`sticky top-8 rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className="mb-6 text-xl font-semibold">Đơn hàng của bạn</h2>
              <div className="mb-6 border-b pb-6">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500">Giỏ hàng trống</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 mb-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Số lượng: {item.quantity}</p>
                        <p className="mt-2 font-semibold text-blue-500">{formatPrice(item.price * item.quantity)}</p>
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
                    className={`flex-grow rounded-xl border p-3 ${darkMode ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-gray-50 text-gray-800"}`}
                  />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white">
                    Áp dụng
                  </motion.button>
                </div>
              </div>
              <div className="mb-6 space-y-3 border-b pb-6">
                <div className="flex justify-between">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Tạm tính</span>
                  <span className="font-medium">{formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Phí vận chuyển</span>
                  <span>{selectedShippingMethod ? formatPrice(selectedShippingMethod.price) : <span className="text-gray-500">Đang tính...</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Giảm giá</span>
                  <span className="text-gray-500">Chưa áp dụng</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-lg font-bold text-blue-500">{formatPrice(calculateTotal())}</span>
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