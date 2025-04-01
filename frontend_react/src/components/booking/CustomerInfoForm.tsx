import React, { useEffect } from "react";
import { Form, Input } from "antd";

interface CustomerInfoFormProps {
  form: any;
  initialData?: {
    fullName?: string;
    phone?: string;
    email?: string;
    note?: string;
  };
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  form,
  initialData,
}) => {
  useEffect(() => {
    if (initialData && !form.getFieldValue("fullName")) { // Chỉ điền nếu form chưa có dữ liệu
      form.setFieldsValue({
        fullName: initialData.fullName,
        phone: initialData.phone,
        email: initialData.email,
        note: initialData.note,
      });
    }
  }, [form, initialData]);

  return (
    <div className="p-6 mb-6 border border-gray-200 rounded-md">
      <h2 className="mb-4 text-lg font-semibold text-center">
        THÔNG TIN KHÁCH HÀNG
      </h2>
      <Form.Item
        label={<span>Họ và tên <span className="text-red-500">*</span></span>}
        name="fullName"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
      >
        <Input placeholder="Nhập họ và tên" className="w-full" />
      </Form.Item>
      <Form.Item
        label={
          <span>Số điện thoại <span className="text-red-500">*</span></span>
        }
        name="phone"
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
      >
        <Input placeholder="Nhập số điện thoại" className="w-full" />
      </Form.Item>
      <Form.Item
        label={<span>Email <span className="text-red-500">*</span></span>}
        name="email"
        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
      >
        <Input placeholder="Nhập email" className="w-full" />
      </Form.Item>
      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea
          placeholder="Nhập ghi chú"
          rows={3}
          className="w-full"
        />
      </Form.Item>
    </div>
  );
};

export default CustomerInfoForm;