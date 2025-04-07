import React, { useEffect } from "react";
import { Form, Input } from "antd";
import { useSelector } from "react-redux";

interface CustomerInfoFormProps {
  form: any;
  initialData?: {
    fullName?: string;
    phone?: string;
    email?: string;
    note?: string;
  };
}

interface SpaBookingState {
  guestUserInfo: { fullName?: string; phone?: string; email?: string; note?: string };
}

interface CartState {
  userId: string | null;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  form,
  initialData,
}) => {
  const spaBooking = useSelector(
    (state: { spaBooking: SpaBookingState }) => state.spaBooking
  );
  const { userId } = useSelector((state: { cart: CartState }) => state.cart);

  useEffect(() => {
    if (!userId && Object.keys(spaBooking.guestUserInfo).length > 0) {
      form.setFieldsValue(spaBooking.guestUserInfo);
    } else if (initialData && !form.getFieldValue("fullName")) {
      form.setFieldsValue({
        fullName: initialData.fullName,
        phone: initialData.phone,
        email: initialData.email,
        note: initialData.note,
      });
    }
  }, [form, initialData, spaBooking.guestUserInfo, userId]);

  return (
    <div className="p-6 mb-6 border border-gray-200 rounded-md">
      <h2 className="mb-4 text-lg font-semibold text-center">
        THÔNG TIN KHÁCH HÀNG
      </h2>
      <Form.Item
        label={<span>Họ và tên <span className="text-red-500">*</span></span>}
        name="fullName"
      >
        <Input placeholder="Nhập họ và tên" className="w-full" />
      </Form.Item>
      <Form.Item
        label={
          <span>Số điện thoại <span className="text-red-500">*</span></span>
        }
        name="phone"
      >
        <Input placeholder="Nhập số điện thoại" className="w-full" />
      </Form.Item>
      <Form.Item
        label={<span>Email <span className="text-red-500">*</span></span>}
        name="email"
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