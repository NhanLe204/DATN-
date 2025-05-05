import React, { useEffect, useRef } from "react";
import { Form, Input } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setGuestUserInfo } from "../../redux/slices/spaBookingSlice";
import debounce from "lodash/debounce";

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
  const dispatch = useDispatch();
  const spaBooking = useSelector(
    (state: { spaBooking: SpaBookingState }) => state.spaBooking
  );
  const { userId } = useSelector((state: { cart: CartState }) => state.cart);
  const isProgrammaticUpdate = useRef(false);

  useEffect(() => {
    if (initialData && !form.getFieldValue("fullName")) {
      isProgrammaticUpdate.current = true;
      form.setFieldsValue({
        fullName: initialData.fullName,
        phone: initialData.phone,
        email: initialData.email,
        note: initialData.note,
      });
      isProgrammaticUpdate.current = false;
    }
  }, [form, initialData]);

  const debouncedSetGuestUserInfo = debounce((guestInfo) => {
    dispatch(setGuestUserInfo(guestInfo));
  }, 500);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (isProgrammaticUpdate.current) return;
  
    // Chỉ lưu guestUserInfo nếu không có userId
    if (!userId) {
      const guestInfo = {
        fullName: allValues.fullName || "",
        phone: allValues.phone || "",
        email: allValues.email || "",
        note: allValues.note || "",
      };
      console.log("CustomerInfoForm - GuestInfo to dispatch:", guestInfo);
      debouncedSetGuestUserInfo(guestInfo);
    }
  };

  return (
    <div className="p-6 mb-6 border border-gray-200 rounded-md">
      <h2 className="mb-4 text-lg font-semibold text-center">
        THÔNG TIN KHÁCH HÀNG
      </h2>
      <Form.Item
        label={<span>Họ và tên <span className="text-red-500">*</span></span>}
        name="fullName"
        rules={[
          { required: true, message: "Vui lòng nhập họ và tên!" },
          { max: 50, message: "Họ và tên không được vượt quá 50 ký tự!" },
        ]}
      >
        <Input placeholder="Nhập họ và tên" className="w-full" />
      </Form.Item>
      <Form.Item
        label={<span>Số điện thoại <span className="text-red-500">*</span></span>}
        name="phone"
        rules={[
          { required: true, message: "Vui lòng nhập số điện thoại!" },
          {
            pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
            message: "Số điện thoại không hợp lệ!",
          },
        ]}
      >
        <Input placeholder="Nhập số điện thoại" className="w-full" />
      </Form.Item>
      <Form.Item
        label={<span>Email <span className="text-red-500">*</span></span>}
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không hợp lệ!" },
        ]}
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