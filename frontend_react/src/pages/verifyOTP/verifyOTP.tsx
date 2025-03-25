// VerifyOtp.js
import React, { useState } from "react";
import { Button, Typography, Input, notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import signupApi from "../../api/signupApi";

const { Title, Text } = Typography;

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate("/signup");
    return null;
  }

  const handleSubmit = async () => {
    if (!otp.trim() || otp.length !== 6) {
      notification.warning({
        message: "Lỗi!",
        description: "OTP phải là 6 chữ số!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await signupApi.verifyOtp(email, otp);
      if (!data.success) {
        throw new Error(data.message || "Xác thực OTP thất bại!");
      }

      notification.success({
        message: "Xác thực thành công!",
        description: "Bạn có thể đăng nhập ngay bây giờ.",
        placement: "topRight",
        duration: 2,
        onClose: () => {
          navigate("/login");
        },
      });
    } catch (error) {
      notification.error({
        message: "Xác thực thất bại!",
        description: `Đã xảy ra lỗi: ${error.message}`,
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 py-4 sm:px-5 sm:py-6 flex justify-center items-center h-screen">
      <div className="w-full max-w-[400px] p-5 bg-white shadow-md rounded">
        <Title level={4} className="text-center">Xác thực OTP</Title>
        <Text className="block text-center mb-4">
          Nhập mã OTP được gửi đến {email}
        </Text>
        <Input
          placeholder="Nhập mã OTP (6 chữ số)"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="mb-4 h-10 text-sm"
        />
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          className="w-full h-10"
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </div>
    </div>
  );
}