import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Button } from "antd";
import orderApi from "../../api/orderApi";
import { clearProduct } from "../../redux/slices/cartslice";
import { useDispatch } from "react-redux";
import Loader from "../../components/LoaderPayment";

const SuccessPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInvalidAccess, setIsInvalidAccess] = useState(false); // Trạng thái để kiểm tra truy cập không hợp lệ

  useEffect(() => {
    // Lấy query parameters từ URL
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get("vnp_ResponseCode"); // Mã phản hồi
    const orderId = queryParams.get("vnp_TxnRef"); // Mã đơn hàng
    const transactionNo = queryParams.get("vnp_TransactionNo"); // Mã giao dịch VNPay
    const amount = queryParams.get("vnp_Amount"); // Số tiền
    const secureHash = queryParams.get("vnp_SecureHash"); // Chuỗi mã hóa

    // Kiểm tra xem có phải truy cập không hợp lệ hay không
    if (!responseCode || !orderId) {
      setIsInvalidAccess(true); // Đánh dấu là truy cập không hợp lệ
      message.warning(
        "Truy cập không hợp lệ. Vui lòng quay lại trang mua hàng."
      );
      return;
    }

    // Kiểm tra trạng thái giao dịch
    if (responseCode === "00") {
      // Thanh toán thành công
      message.success(
        "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận."
      );
      dispatch(clearProduct());

      // Cập nhật trạng thái đơn hàng
      orderApi
        .updatePaymentStatus(orderId, {
          payment_status: "PAID",
        })
        .then(() => {
          // Chuyển hướng về trang đơn hàng hoặc trang chủ
          setTimeout(() => navigate("/userprofile/orders"), 3000);
        })
        .catch((error) => {
          console.error("Error updating order:", error);
          message.error("Có lỗi xảy ra khi cập nhật đơn hàng.");
        });
    } else {
      // Thanh toán thất bại
      message.error(`Thanh toán thất bại`);
      orderApi
        .updatePaymentStatus(orderId, { payment_status: "CANCELLED" })
        .then(() => {
          setTimeout(() => navigate("/cancel"), 1000);
        })
        .catch((error) => {
          navigate("/");
          message.error("Có lỗi xảy ra khi cập nhật đơn hàng.");
          console.error("Error updating order:", error);
        });
    }
  }, [location, navigate]);

  // Hàm xử lý khi người dùng nhấn nút "Tiếp tục mua hàng"
  const handleContinueShopping = () => {
    navigate("/"); // Chuyển hướng về trang chủ (hoặc /products)
  };

  // Nếu truy cập không hợp lệ, hiển thị thông báo và nút "Tiếp tục mua hàng"
  if (isInvalidAccess) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Truy cập không hợp lệ</h2>
        <p>Bạn không thể truy cập trang này trực tiếp.</p>
        <Button
          type="primary"
          className="m-2 px-8 py-6 bg-[#22A6DF] hover:bg-[#1890ff] hover:border-[#22A6DF] rounded-lg text-white text-xs sm:text-sm"
          onClick={handleContinueShopping}
        >
          Tiếp tục mua hàng
        </Button>
      </div>
    );
  }

  // Nếu truy cập hợp lệ, hiển thị thông báo xử lý
  return (
    <div>
      <h2>
        <Loader />
      </h2>
    </div>
  );
};

export default SuccessPage;
