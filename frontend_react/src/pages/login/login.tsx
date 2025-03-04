import React, { useState, useEffect } from "react";

declare global {
  interface Window {
    google: any;
  }
}
import { FcGoogle } from "react-icons/fc";
import { FaCheckDouble } from "react-icons/fa6";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  GoogleCredentialResponse,
} from "@react-oauth/google";
import {
  Button,
  Row,
  Col,
  Typography,
  Input,
  Flex,
  notification,
  Modal,
} from "antd";
import "antd/dist/reset.css";
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import ENV_VARS from "../../../config";
const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  role: string;
  status: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isSending, setIsSending] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  // Check role & status
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);

      // Kiểm tra status
      if (parsedUser.status !== "active") {
        notification.error({
          message: "Truy cập bị từ chối!",
          description: "Tài khoản của bạn không hoạt động.",
          placement: "topRight",
          duration: 2,
        });
        localStorage.removeItem("userData");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accountID");
        setUser(null);
      }

      // Kiểm tra role 
      if (parsedUser.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    }
  }, []);

  // handle login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ENV_VARS.VITE_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      var data = await response.json();
      console.log("Phản hồi từ API:", response, data);

      if (response.ok) {
        const { userData, accessToken } = data;
        setUser(userData);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accountID", JSON.stringify(userData._id));
        localStorage.setItem("userData", JSON.stringify(userData));

        // Kiểm tra status trước khi điều hướng
        if (userData.status !== "active") {
          notification.error({
            message: "Truy cập bị từ chối!",
            description: "Tài khoản của bạn không hoạt động.",
            placement: "topRight",
            duration: 2,
          });
          localStorage.removeItem("userData");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("accountID");
          setUser(null);
          setLoading(false); // Đặt loading về false sau khi xóa dữ liệu
          return;
        }

        // Hiển thị thông báo thành công và điều hướng dựa trên role
        notification.success({
          message: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại!",
          placement: "topRight",
          duration: 1.5,
          onClose: () => {

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem(
              "accountID",
              JSON.stringify(data.userData._id)
            );
            localStorage.setItem("userData", JSON.stringify(data.userData));
            setTimeout(() => {
              if (data.userData.role === "admin") {
                window.location.href = "/admin";
              } else {
                window.location.href = "/";
              }
            }, 1000);
          },
        });
      } else {
        throw new Error("Đăng nhập thất bại");
      }
    } catch (error) {
      notification.error({
        message: `${data.message || "Lỗi!"}`,
        description:
          error.message || "Có lỗi xảy ra trong quá trình đăng nhập, vui lòng thử lại.",
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      notification.warning({
        message: "Vui lòng nhập email!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/forgotPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        notification.success({
          message: "Kiểm tra email!",
          description: "Hãy kiểm tra hộp thư của bạn để đặt lại mật khẩu.",
          placement: "topRight",
          duration: 2,
        });
        setIsForgotPasswordModalOpen(false);
        setIsResetPasswordModalOpen(true);
      } else {
        throw new Error(data.message || "Không thể gửi yêu cầu!");
      }
    } catch (error) {
      notification.error({
        message: "Lỗi!",
        description: "Không thể gửi yêu cầu quên mật khẩu.",
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword) {
      notification.warning({
        message: "Vui lòng nhập mã xác nhận và mật khẩu mới!",
        placement: "topRight",
        duration: 2,
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/resetPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resetToken, newPassword }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        notification.success({
          message: "Mật khẩu đã được đặt lại thành công!",
          placement: "topRight",
          duration: 2,
        });
        setIsResetPasswordModalOpen(false);
        setForgotEmail("");
        setResetToken("");
        setNewPassword("");
      } else {
        throw new Error(data.message || "Không thể đặt lại mật khẩu!");
      }
    } catch (error) {
      notification.error({
        message: "Lỗi!",
        description: error.message,
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Chức năng đăng nhập GOOGLE
  const handleGoogleLogin = (credentialResponse: GoogleCredentialResponse) => {
    const idToken = credentialResponse.credential;
    console.log("Sending idToken to backend:", idToken);
    fetch("http://localhost:5000/api/v1/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })
      .then((res) => {
        console.log("Response status:", res.status);
        console.log("Response headers:", res.headers);
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Server error: ${res.status} - ${text}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            fullname: data.user.fullname,
            avatar: data.user.avatar,
            role: data.user.role,
            status: data.user.status,
          });
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("accountID", data.user.id);
          notification.success({
            message: "Đăng nhập bằng Google thành công!",
            description: "Chào mừng bạn quay trở lại!",
            placement: "topRight",
            duration: 2,
            onClose: () => {
              setTimeout(() => {
                if (data.user.role === "admin") {
                  window.location.href = "/admin";
                } else {
                  window.location.href = "/";
                }
              }, 2000);
            },
          });
        } else {
          console.error("Login failed:", data.message);
          notification.error({
            message: "Đăng nhập thất bại!",
            description:
              data.message || "Có lỗi xảy ra khi đăng nhập bằng Google.",
            placement: "topRight",
            duration: 2,
          });
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        notification.error({
          message: "Lỗi!",
          description: err.message || "Có lỗi xảy ra khi kết nối với Google.",
          placement: "topRight",
          duration: 2,
        });
      });
  };

  return (
    <div className="px-2 py-4 sm:px-5 sm:py-6">
      {/* Title */}
      <div className="mx-auto pb-4 text-center sm:pb-7">
        <Title level={4} className="text-xl sm:text-2xl">
          Đăng Nhập
        </Title>
        <Flex justify="center" className="gap-1 sm:gap-2">
          <span
            onMouseEnter={(e) => {
              e.currentTarget.style.cursor = "pointer";
            }}
            onClick={() => (window.location.href = "/")}
            className="text-sm sm:text-base"
          >
            Trang chủ
          </span>
          <span className="px-1 sm:px-2">/</span>
          <span className="text-base sm:text-lg"> Đăng nhập</span>
        </Flex>
      </div>

      <Row
        justify="center"
        className="mx-auto min-h-[450px] w-full max-w-[830px] flex-col gap-4 overflow-hidden px-2 sm:gap-7 sm:px-0 lg:flex-row"
      >
        {/* left */}
        <Col className="flex w-full flex-col justify-between gap-4 sm:gap-0 lg:w-[400px]">
          <div className="h-[200px] sm:h-1/2">
            <img
              src="https://picsum.photos/300/200"
              alt="Login form"
              className="h-full w-full bg-[#EAEAEA] object-cover"
            />
          </div>

          <div className="h-auto bg-[#EAEAEA] p-3 text-xs sm:h-1/2 sm:p-4 sm:text-sm">
            <Title level={5} className="text-sm sm:text-base">
              Quyền lợi thành viên
            </Title>
            <ul className="list-disc space-y-2 pl-4 sm:space-y-4">
              <li className="flex items-center gap-2">
                <FaCheckDouble className="h-3 w-3 shrink-0 text-[#22A6DF] sm:h-4 sm:w-4" />
                <span>Mua hàng nhanh chóng, dễ dàng</span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheckDouble className="h-3 w-3 shrink-0 text-[#22A6DF] sm:h-4 sm:w-4" />
                <span>
                  Theo dõi chi tiết đơn hàng, địa chỉ thanh toán dễ dàng
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheckDouble className="h-3 w-3 shrink-0 text-[#22A6DF] sm:h-4 sm:w-4" />
                <span>Nhận nhiều chương trình ưu đãi từ chúng tôi</span>
              </li>
            </ul>
          </div>
        </Col>

        {/* right */}
        <Col className="flex w-full flex-col justify-between shadow-inner lg:w-[400px] overflow-auto">
          <div>
            <div className="mb-3 flex h-10 sm:h-12">
              <button className="h-full w-1/2 rounded-none border-[#22A6DF] bg-[#22A6DF] text-sm text-white sm:text-base">
                Đăng Nhập
              </button>
              <button
                onClick={() => (window.location.href = "/signup")} // Thay router.push
                className="h-full w-1/2 rounded-none border border-[#686868] text-sm hover:border-[#22A6DF] hover:text-[#22A6DF] sm:text-base"
              >
                Đăng Ký
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="mb-2 pb-2 text-sm sm:text-base">
                <label htmlFor="email" className="font-bold uppercase">
                  Email <span className="text-red-600">*</span>
                </label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Nhập email của bạn"
                  className="mt-2 h-9 text-sm sm:h-10 sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-2 pb-2 text-sm sm:text-base">
                <label htmlFor="password" className="font-bold uppercase">
                  Mật khẩu <span className="text-red-600">*</span>
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Nhập mật khẩu của bạn"
                  className="mt-2 h-9 text-sm sm:h-10 sm:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suffix={
                    <span 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </span>
                  }
                />
              </div>
              <div className="mb-3">
                <a
                  className="cursor-pointer text-sm sm:text-base"
                  onClick={() => setIsForgotPasswordModalOpen(true)}
                >
                  Quên mật khẩu?
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center px-2 sm:px-4 mb-4">
            <Flex
              justify="space-between"
              className="w-full max-w-[380px] items-center"
            >
              <Button
                type="primary"
                size="large"
                className="h-9 w-[46%] rounded-md bg-black text-xs text-white hover:bg-[#22A6DF] sm:h-10 sm:text-sm"
                onClick={handleLogin}
                loading={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <span className="my-auto px-1 text-sm sm:text-base">Hoặc</span>
              <GoogleOAuthProvider clientId="518751281700-f8vq0pf1792lcv7risc93qd5b6ccb70g.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  size="medium"
                  width={36}
                  type="standard"
                  onError={() => {
                    notification.error({
                      message: "Đăng nhập thất bại!",
                      description: "Có lỗi xảy ra khi đăng nhập bằng Google.",
                      placement: "topRight",
                      duration: 2,
                    });
                  }}
                />
              </GoogleOAuthProvider>
            </Flex>
          </div>

          <div className="px-3 pt-2 text-center sm:px-4 sm:pt-4">
            <Text type="secondary" className="text-[10px] sm:text-xs">
              Pet Heaven cam kết bảo mật và sẽ không tiết lộ thông tin khách
              hàng khi không có sự cho phép.
            </Text>
          </div>
        </Col>
      </Row>

      <Modal
        title="Quên Mật Khẩu"
        open={isForgotPasswordModalOpen}
        onCancel={() => setIsForgotPasswordModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsForgotPasswordModalOpen(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSending}
            onClick={handleForgotPassword}
          >
            Gửi
          </Button>,
        ]}
      >
        <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
        <Input
          type="email"
          placeholder="Nhập email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
        />
      </Modal>

      <Modal
        title="Đặt Lại Mật Khẩu"
        open={isResetPasswordModalOpen}
        onCancel={() => setIsResetPasswordModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsResetPasswordModalOpen(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSending}
            onClick={handleResetPassword}
          >
            Đặt lại
          </Button>,
        ]}
      >
        <p>Nhập mã xác nhận và mật khẩu mới của bạn.</p>
        <Input
          className="mb-2"
          type="text"
          placeholder="Mã xác nhận"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
}