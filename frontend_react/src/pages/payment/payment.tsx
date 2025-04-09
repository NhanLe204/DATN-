"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
// import { usePayOS, PayOSConfig } from "payos-checkout";
import {
  ChevronRight,
  Package,
  CheckCircle,
  CreditCard,
  Truck,
  MapPin,
  DollarSign,
  X,
} from "lucide-react";
import { Form, Input, message, Modal, Select } from "antd";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";
import deliveryApi from "../../api/deliveryApi";
import paymentTypeApi from "../../api/paymentTypeApi";
import couponApi from "../../api/couponApi";
import paymentApi from "../../api/paymentApi";
import { clearProduct } from "../../redux/slices/cartslice";
import ENV_VARS from "../../../config";
const { Item } = Form;

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
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorder, setIsReorder] = useState(false);

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

  const [user, setUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addressForm] = Form.useForm();
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editAddressIndex, setEditAddressIndex] = useState<number | null>(null);

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
          setUser(userData);
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
          setUser(null);
        }
      };

      const fetchDeliveryMethods = async () => {
        try {
          const deliveryResponse = await deliveryApi.getAllDelivery();
          const deliveryMethods: Delivery[] = deliveryResponse.data.data || [];
          setShippingMethods(deliveryMethods);

          // Tính tổng giá trị đơn hàng (subtotal)
          const subtotal = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          // Tìm phương thức miễn phí vận chuyển (delivery_fee === 0)
          const freeShipping = deliveryMethods.find(
            (method) => method.delivery_fee === 0
          );

          // Logic chọn phương thức mặc định
          if (subtotal >= 200000 && freeShipping) {
            setSelectedShippingMethod(freeShipping);
          } else if (deliveryMethods.length > 0) {
            // Nếu không có phương thức tiêu chuẩn, chọn phương thức đầu tiên không phải miễn phí
            const firstNonFreeMethod = deliveryMethods.find(
              (method) => method.delivery_fee > 0
            );
            setSelectedShippingMethod(firstNonFreeMethod || deliveryMethods[0]);
          }
        } catch (error) {
          console.error("Failed to fetch delivery methods:", error);
          message.error(
            "Không thể tải phương thức vận chuyển. Vui lòng thử lại!"
          );
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

      if (location.state?.reorderItems) {
        setIsReorder(true);
      }
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
  }, [location.state]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((error) => {
        console.error("Lỗi khi fetch tỉnh:", error);
        message.error("Không thể tải danh sách tỉnh!");
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
          setWards([]);
          setSelectedDistrict(null);
          addressForm.setFieldsValue({ district: null, ward: null });
        })
        .catch((error) => {
          console.error("Lỗi khi fetch quận/huyện:", error);
          message.error("Không thể tải danh sách quận/huyện!");
        });
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []))
        .catch((error) => {
          console.error("Lỗi khi fetch phường/xã:", error);
          message.error("Không thể tải danh sách phường/xã!");
        });
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  const resetAddressForm = () => {
    addressForm.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
  };

  const handleOk = () => {
    addressForm
      .validateFields()
      .then(async (values) => {
        const accountID = localStorage
          .getItem("accountID")
          ?.replace(/"/g, "")
          .trim();
        if (!accountID) {
          message.error(
            "Không tìm thấy ID người dùng trong localStorage! Vui lòng đăng nhập lại."
          );
          navigate("/login");
          return;
        }

        if (!user) {
          message.error(
            "Không tìm thấy thông tin người dùng! Vui lòng thử lại."
          );
          return;
        }

        const provinceName =
          provinces.find((p) => p.code === values.province)?.name || "";
        const districtName =
          districts.find((d) => d.code === values.district)?.name || "";
        const wardName = wards.find((w) => w.code === values.ward)?.name || "";
        const fullAddress =
          `${values.address}, ${wardName}, ${districtName}, ${provinceName}`.trim();

        const newAddress: Address = {
          name: values.name,
          phone: values.phone,
          address: fullAddress,
          isDefault: false, // Địa chỉ mới không phải là mặc định
        };

        try {
          const userUpdateResponse = await userApi.addAddress(
            accountID,
            newAddress
          );
          const updatedAddresses = [...(user.address || []), newAddress];
          const updatedUser = { ...user, address: updatedAddresses };
          setUser(updatedUser);
          setAddresses(updatedAddresses); // Cập nhật danh sách địa chỉ

          // Cập nhật selectedAddress nếu chưa có địa chỉ nào được chọn
          if (!selectedAddress) {
            setSelectedAddress(newAddress);
            setCheckedAddressId(newAddress._id || null);
            setFormData({
              fullName: newAddress.name,
              phone: newAddress.phone,
              address: newAddress.address,
            });
          }

          localStorage.setItem("userData", JSON.stringify(updatedUser));
          setIsModalVisible(false);
          resetAddressForm();
          message.success("Thêm địa chỉ thành công!");
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định";
          message.error(`Thêm địa chỉ thất bại: ${errorMessage}`);
          console.log("Dữ liệu gửi lên API:", newAddress);
          console.error("Lỗi từ server:", error);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleEditOk = () => {
    addressForm
      .validateFields()
      .then(async (values) => {
        const accountID = localStorage
          .getItem("accountID")
          ?.replace(/"/g, "")
          .trim();
        if (!accountID || !user || editAddressIndex === null) {
          message.error("Không tìm thấy thông tin người dùng hoặc địa chỉ!");
          return;
        }

        const provinceName =
          provinces.find((p) => p.code === values.province)?.name || "";
        const districtName =
          districts.find((d) => d.code === values.district)?.name || "";
        const wardName = wards.find((w) => w.code === values.ward)?.name || "";
        const fullAddress =
          `${values.address}, ${wardName}, ${districtName}, ${provinceName}`.trim();

        const updatedAddress: Address = {
          name: values.name,
          phone: values.phone,
          address: fullAddress,
          isDefault: user.address[editAddressIndex].isDefault, // Giữ nguyên trạng thái isDefault
        };

        try {
          const userUpdateResponse = await userApi.updateAddress(
            accountID,
            editAddressIndex,
            updatedAddress
          );
          const updatedAddresses = [...(user.address || [])];
          updatedAddresses[editAddressIndex] = updatedAddress;
          const updatedUser = { ...user, address: updatedAddresses };
          setUser(updatedUser);
          localStorage.setItem("userData", JSON.stringify(updatedUser));
          setIsEditModalVisible(false);
          resetAddressForm();
          setEditAddressIndex(null);
          message.success("Cập nhật địa chỉ thành công!");
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định";
          message.error(`Cập nhật địa chỉ thất bại: ${errorMessage}`);
          console.log("Dữ liệu gửi lên API:", updatedAddress);
          console.error("Lỗi từ server:", error);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/; // Bắt đầu bằng 03, 05, 07, 08, 09 và đủ 10 số
    if (value && !phoneRegex.test(value)) {
      return Promise.reject(
        new Error(
          "Số điện thoại không hợp lệ! Phải bắt đầu bằng 03, 05, 07, 08, 09 và đủ 10 số."
        )
      );
    }
    return Promise.resolve();
  };

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

  const calculateTotal = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountedSubtotal = subtotal - discount;
    const total =
      discountedSubtotal +
      (selectedShippingMethod ? selectedShippingMethod.delivery_fee : 0);
    return Math.max(total, 0);
  }, [cartItems, discount, selectedShippingMethod]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const processCheckout = async () => {
    try {
      const shippingAddress = formData.address;
      const orderData = {
        userID: userId,
        couponID: appliedCoupon ? appliedCoupon._id : null,
        payment_typeID: selectedPayment,
        deliveryID: selectedShippingMethod?._id,
        orderdate: new Date().toISOString(),
        total_price: calculateTotal,
        shipping_address: shippingAddress,
        orderDetails: cartItems.map((item) => ({
          productID: item.id,
          serviceID: null,
          quantity: item.quantity,
          product_price: item.price,
        })),
      };

      const totalAmount = calculateTotal;
      const orderResponse = await orderApi.create(orderData);
      const createdOrder = orderResponse.data;
      const order = createdOrder.order;
      console.log("Order created:", order);
      const paymentData = {
        orderId: order._id,
        amount: totalAmount,
        description: `Thanh toán đơn hàng`,
        returnUrl: `${ENV_VARS.VITE_API_URL}/success`,
        cancelUrl: `${ENV_VARS.VITE_API_URL}/cancel`,
      };

      console.warn("Creating payment with data:", paymentData);
      if (orderResponse) {
        // Backend sẽ tự động chuyển đến trang thanh toán và trả về URL
        message.success("Đơn hàng của bạn đã được tạo thành công!");
        await handlePayment(paymentData);
      } else {
        message.error("Không thể tạo đơn hàng!");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!");
    }
  };

  const handlePayment = async (paymentData: any) => {
    try {
      const response = await paymentApi.create({
        ...paymentData,
      });
      const checkoutUrl = response.url;
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
      if (isReorder) {
        Modal.confirm({
          title: "Xác nhận đặt lại đơn hàng",
          content:
            "Bạn đang đặt lại một đơn hàng cũ. Bạn có chắc chắn muốn tiếp tục?",
          onOk: processCheckout,
          okText: "Xác nhận",
          cancelText: "Hủy",
        });
      } else {
        processCheckout();
      }

      message.loading("Đang xử lý đơn hàng...", 0);
      // message.destroy();
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <div className="container mx-auto px-[154px] py-8">
          <nav className="mb-6 rounded-xl p-4 bg-white shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 hover:text-gray-900">
                Trang chủ
              </span>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-gray-900">Thông tin giao hàng</span>
            </div>
          </nav>

          {isReorder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 rounded-xl p-4 bg-green-50`}
            >
              <span className="text-green-500">
                Đây là đơn hàng được tái tạo từ đơn cũ. Vui lòng kiểm tra thông
                tin trước khi đặt lại!
              </span>
            </motion.div>
          )}

          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl p-4 bg-blue-50"
            >
              <span>
                Bạn đã có tài khoản?{" "}
                <span
                  className="ml-1 cursor-pointer font-bold text-blue-500 hover:text-blue-600"
                  onClick={() => navigate("/login")}
                >
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
              <div className="mb-8 rounded-xl p-6 bg-white">
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
                          <p className="text-gray-600">
                            | {selectedAddress.phone}
                          </p>
                          {selectedAddress.isDefault && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">
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
                  <div className="mb-4">
                    <p className="text-gray-500">
                      {isLoggedIn
                        ? "Chưa có địa chỉ nào. Vui lòng thêm địa chỉ."
                        : "Vui lòng đăng nhập để xem địa chỉ."}
                    </p>
                    {isLoggedIn && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModalVisible(true)}
                        className="mt-2 text-blue-500 font-medium hover:text-blue-600"
                      >
                        Thêm địa chỉ
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl rounded-2xl p-8 bg-white text-gray-800 shadow-lg"
                  >
                    {/* Header của modal */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Chọn địa chỉ giao hàng
                      </h3>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Danh sách địa chỉ */}
                    <div className="max-h-[500px] overflow-y-auto pr-2">
                      {addresses.length > 0 ? (
                        addresses.map((address: Address, index) => (
                          <motion.div
                            key={
                              address._id || `${address.name}-${address.phone}`
                            }
                            className="p-4 mb-3 border-b border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {/* Radio button để chọn địa chỉ */}
                              <input
                                type="radio"
                                name="address"
                                checked={checkedAddressId === address._id}
                                onChange={() =>
                                  setCheckedAddressId(address._id || null)
                                }
                                className="h-5 w-5 text-blue-600 mt-1 cursor-pointer"
                              />
                              {/* Thông tin địa chỉ */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <p className="font-semibold text-lg text-gray-800">
                                      {address.name}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      | {address.phone}
                                    </p>
                                    {address.isDefault && (
                                      <span className="inline-block px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full">
                                        Mặc định
                                      </span>
                                    )}
                                  </div>
                                  {/* Nút Sửa */}
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setEditAddressIndex(index); // Lưu index của địa chỉ cần sửa
                                      setIsEditModalVisible(true); // Mở modal chỉnh sửa
                                      // Điền dữ liệu vào form chỉnh sửa
                                      addressForm.setFieldsValue({
                                        name: address.name,
                                        phone: address.phone,
                                        address: address.address.split(",")[0], // Lấy phần địa chỉ nhà
                                        province: provinces.find((p) =>
                                          address.address.includes(p.name)
                                        )?.code,
                                        district: districts.find((d) =>
                                          address.address.includes(d.name)
                                        )?.code,
                                        ward: wards.find((w) =>
                                          address.address.includes(w.name)
                                        )?.code,
                                      });
                                    }}
                                    className="text-blue-500 font-medium hover:text-blue-600 text-sm"
                                  >
                                    Sửa
                                  </motion.button>
                                </div>
                                <p className="text-gray-600 mt-1">
                                  {address.address}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-6">
                          Chưa có địa chỉ nào. Hãy thêm địa chỉ mới!
                        </p>
                      )}
                    </div>

                    {/* Footer của modal */}
                    <div className="flex justify-end gap-3 mt-6">
                      {/* Nút Thêm địa chỉ */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsModalOpen(false); // Đóng modal chọn địa chỉ
                          setIsModalVisible(true); // Mở modal thêm địa chỉ
                        }}
                        className="rounded-xl bg-green-500 px-4 py-2 font-medium text-white text-sm hover:bg-green-600 transition-colors"
                      >
                        Thêm địa chỉ
                      </motion.button>
                      {/* Nút Xác nhận */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleConfirmAddress}
                        className="rounded-xl bg-blue-500 px-4 py-2 font-medium text-white text-sm hover:bg-blue-600 transition-colors"
                      >
                        Xác nhận
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Shipping Method */}
              <div className="mb-8 rounded-xl p-6 bg-white">
                <h2 className="mb-6 text-xl font-semibold flex items-center">
                  <Truck className="mr-2" size={20} /> Phương thức vận chuyển
                </h2>
                {shippingMethods.length > 0 ? (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => {
                      // Vô hiệu hóa nếu là phương thức miễn phí và subtotal < 200.000
                      const isDisabled =
                        method.delivery_fee === 0 && subtotal < 200000;
                      return (
                        <motion.div
                          whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                          key={method._id}
                          onClick={() =>
                            !isDisabled && setSelectedShippingMethod(method)
                          }
                          className={`flex items-center justify-between rounded-xl p-4 ${
                            selectedShippingMethod?._id === method._id
                              ? "border-blue-500 bg-blue-50"
                              : isDisabled
                              ? "bg-gray-200 opacity-50 cursor-not-allowed"
                              : "bg-gray-50"
                          } ${
                            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="mr-3 rounded-full p-2 bg-white">
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-gray-50">
                    <Package size={32} className="text-gray-400" />
                    <p className="mt-3 text-center text-sm text-gray-500">
                      Không có phương thức vận chuyển khả dụng.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-8 rounded-xl p-6 bg-white">
                <h2 className="mb-6 text-xl font-semibold flex items-center">
                  <CreditCard className="mr-2" size={20} /> Phương thức thanh
                  toán
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
                            ? "border-blue-500 bg-blue-50"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="mr-3">
                          <div className="rounded-full p-2 bg-white">
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
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-gray-50">
                    <CreditCard size={32} className="text-gray-400" />
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
              <div className="sticky top-8 rounded-xl p-6 bg-white">
                <h2 className="mb-6 text-xl font-semibold">Đơn hàng của bạn</h2>
                <div className="mb-6 border-b pb-6">
                  {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500">Giỏ hàng trống</p>
                  ) : (
                    <>
                      {cartItems.map((item) => (
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
                            Số lượng: {item.quantity}
                            <p className="mt-2 font-semibold text-blue-500">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isReorder && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            dispatch(clearProduct());
                            setIsReorder(false);
                            message.success(
                              "Đã xóa đơn hàng cũ. Bạn có thể chọn sản phẩm mới!"
                            );
                          }}
                          className="mt-4 w-full rounded-xl bg-red-500 py-2 font-medium text-white hover:bg-red-600"
                        >
                          Xóa và chọn lại
                        </motion.button>
                      )}
                    </>
                  )}
                </div>
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow rounded-xl border p-3 border-gray-300 bg-gray-50 text-gray-800"
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
                    <span className="text-gray-600">Tạm tính</span>
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
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span>
                      {selectedShippingMethod ? (
                        formatPrice(selectedShippingMethod.delivery_fee)
                      ) : (
                        <span className="text-gray-500">Đang tính...</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá</span>
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
                    {formatPrice(calculateTotal)}
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

      <Modal
        title={
          <span className="text-xl font-semibold text-gray-800">
            Thêm địa chỉ mới
          </span>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          resetAddressForm();
        }}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{
          className:
            "bg-[#22A6DF] hover:bg-[#1890ff] text-white font-semibold py-2 px-4 rounded-lg transition duration-200",
        }}
        cancelButtonProps={{
          className:
            "bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200",
        }}
        width={600}
        bodyStyle={{ padding: "24px" }}
      >
        <Form form={addressForm} layout="vertical" className="space-y-6">
          <Item
            name="name"
            label={
              <span className="text-base font-semibold text-gray-700">
                Họ và tên
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              placeholder="Nhập họ và tên"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
            />
          </Item>
          <Item
            name="phone"
            label={
              <span className="text-base font-semibold text-gray-700">
                Số điện thoại
              </span>
            }
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { validator: validatePhoneNumber },
            ]}
          >
            <Input
              placeholder="Nhập số điện thoại"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
            />
          </Item>
          <div className="grid grid-cols-2 gap-4">
            <Item
              name="province"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Tỉnh/Thành phố
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố!" },
              ]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                className="w-full rounded-lg h-12"
                showSearch
                optionFilterProp="children"
                onChange={(value) => setSelectedProvince(value)}
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {provinces.map((province) => (
                  <Select.Option key={province.code} value={province.code}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
            <Item
              name="district"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Quận/Huyện
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                className="w-full rounded-lg h-12"
                showSearch
                optionFilterProp="children"
                disabled={!selectedProvince}
                onChange={(value) => setSelectedDistrict(value)}
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {districts.map((district) => (
                  <Select.Option key={district.code} value={district.code}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Item
              name="ward"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Phường/Xã
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                className="w-full rounded-lg h-12"
                showSearch
                optionFilterProp="children"
                disabled={!selectedDistrict}
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {wards.map((ward) => (
                  <Select.Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
            <Item
              name="address"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Địa chỉ nhà
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ nhà!" },
              ]}
            >
              <Input
                placeholder="Nhập địa chỉ nhà"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
              />
            </Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <span className="text-xl font-semibold text-gray-800">
            Chỉnh sửa địa chỉ
          </span>
        }
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={() => {
          setIsEditModalVisible(false);
          resetAddressForm();
          setEditAddressIndex(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{
          className:
            "bg-[#22A6DF] hover:bg-[#1890ff] text-white font-semibold py-2 px-4 rounded-lg transition duration-200",
        }}
        cancelButtonProps={{
          className:
            "bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200",
        }}
        width={600}
        bodyStyle={{ padding: "24px" }}
      >
        <Form form={addressForm} layout="vertical" className="space-y-6">
          <Item
            name="name"
            label={
              <span className="text-base font-semibold text-gray-700">
                Họ và tên
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              placeholder="Nhập họ và tên"
              className="rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
            />
          </Item>
          <Item
            name="phone"
            label={
              <span className="text-base font-semibold text-gray-700">
                Số điện thoại
              </span>
            }
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { validator: validatePhoneNumber },
            ]}
          >
            <Input
              placeholder="Nhập số điện thoại"
              className="rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
            />
          </Item>
          <div className="grid grid-cols-2 gap-4">
            <Item
              name="province"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Tỉnh/Thành phố
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố!" },
              ]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                className="rounded-lg h-12"
                showSearch
                optionFilterProp="children"
                onChange={(value) => setSelectedProvince(value)}
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {provinces.map((province) => (
                  <Select.Option key={province.code} value={province.code}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
            <Item
              name="district"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Quận/Huyện
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                className="rounded-lg h-12"
                showSearch
                optionFilterProp="children"
                onChange={(value) => setSelectedDistrict(value)}
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {districts.map((district) => (
                  <Select.Option key={district.code} value={district.code}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Item
              name="ward"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Phường/Xã
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
            >
              <Select
                placeholder="Chọn phường/xã"
                className="rounded-lg h-12"
                showSearch
                optionFilterProp="children"
                dropdownStyle={{ borderRadius: "8px" }}
              >
                {wards.map((ward) => (
                  <Select.Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
            <Item
              name="address"
              label={
                <span className="text-base font-semibold text-gray-700">
                  Địa chỉ nhà
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ nhà!" },
              ]}
            >
              <Input
                placeholder="Nhập địa chỉ nhà"
                className="rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
              />
            </Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default Payment;
