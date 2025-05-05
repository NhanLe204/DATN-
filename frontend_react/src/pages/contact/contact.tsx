import React, { useState } from "react";
import { Input, Button, Form, message } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import contactApi from "../../api/contactApi"; // Import contactApi đã có

// Định nghĩa interface cho dữ liệu form
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Định nghĩa interface cho thông tin liên hệ
interface ContactInfo {
  icon: JSX.Element;
  title: string;
  content: string;
}

const ContactPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false); // Trạng thái loading

  // Hàm xử lý khi submit form
  const onFinish = async (values: ContactFormData) => {
    setLoading(true);
    try {
      const response = await contactApi.submitContactForm(values);
      if (response.success) {
        message.success(
          "Cảm ơn bạn đã gửi thông tin. Chúng tôi sẽ liên hệ lại sớm!"
        );
        form.resetFields(); // Reset form sau khi gửi thành công
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gửi thông tin thất bại!");
      }
    } catch (error: any) {
      message.error(
        error.message || "Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu thông tin liên hệ
  const contactInfo: ContactInfo[] = [
    {
      icon: <EnvironmentOutlined className="text-2xl text-blue-500" />,
      title: "Địa chỉ",
      content:
        "113 Dương Quảng Hàm, Phường 5, Quận Gò Vấp, Thành phố Hồ Chí Minh, Việt Nam",
    },
    {
      icon: <PhoneOutlined className="text-2xl text-blue-500" />,
      title: "Số điện thoại",
      content: "0393153129",
    },
    {
      icon: <MailOutlined className="text-2xl text-blue-500" />,
      title: "Email",
      content: `petheaven73@gmail.com`,
    },
    {
      icon: <ClockCircleOutlined className="text-2xl text-blue-500" />,
      title: "Thời gian làm việc",
      content: "8h - 21h từ thứ 2 đến thứ 7\n8h - 19h chủ nhật",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Main Content */}
        <div className="overflow-hidden rounded-xl bg-while shadow-lg">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-8">
            {/* Contact Information */}
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 lg:p-8">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Thông tin liên hệ
              </h2>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="group flex items-start space-x-4">
                    <div className="flex-shrink-0 rounded-lg bg-white p-2 shadow-sm transition-shadow group-hover:shadow-md">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="mt-1 whitespace-pre-line text-gray-600">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-6 lg:p-8">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Gửi thắc mắc cho chúng tôi
              </h2>
              <p className="mb-6 text-gray-600">
                Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và
                chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-4"
              >
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên của bạn!" },
                  ]}
                >
                  <Input
                    placeholder="Tên của bạn"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input
                      placeholder="Email của bạn"
                      className="h-12 rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Số điện thoại"
                      className="h-12 rounded-lg"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="message"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung!" },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Nội dung tin nhắn"
                    className="rounded-lg"
                    rows={4}
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-12 w-full rounded-lg bg-blue-500 px-8 text-base font-semibold transition-colors hover:bg-blue-600 sm:w-auto"
                    loading={loading}
                  >
                    Gửi cho chúng tôi
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
