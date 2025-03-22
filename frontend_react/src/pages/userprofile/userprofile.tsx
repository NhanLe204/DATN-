"use client";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Upload,
  message,
} from "antd";
import { DatePicker } from "antd";
import { FaUser, FaMoneyCheckAlt, FaEdit, FaTrash } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import ENV_VARS from "../../../config";
import userApi from "../../api/userApi";

const { Item } = Form;

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

interface Address {
  name: string;
  phone: string;
  address: string; // Chuỗi địa chỉ đầy đủ
}

export default function UserProfile() {
  const params = useParams();
  const type = params["*"] || "account";
  const [form] = Form.useForm();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addressForm] = Form.useForm();
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      const accountID = localStorage
        .getItem("accountID")
        ?.replace(/"/g, "")
        .trim();

      if (!token || !accountID) {
        setUser(null);
        return;
      }

      try {
        const userResponse = await userApi.getUserById(accountID);
        const userData = await userResponse.data.data;
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(null);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone_number || "",
        birthDate: user.dateOfBirth ? dayjs(user.dateOfBirth, "YYYY-MM-DD") : null,
      });
    }
  }, [user, form]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (user) {
      form.resetFields();
      form.setFieldsValue({
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone_number || "",
        birthDate: user.dateOfBirth ? dayjs(user.dateOfBirth, "YYYY-MM-DD") : null,
      });
    }
    setIsEditing(false);
  };

  const onFinish = async (values: any) => {
    const token = localStorage.getItem("accessToken");
    const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

    if (!token || !accountID) {
      message.error("Thiếu token hoặc accountID!");
      return;
    }

    const updatedData = {
      fullname: values.fullname || undefined,
      email: values.email || undefined,
      phone_number: values.phone || undefined,
      dateOfBirth: values.birthDate?.format("YYYY-MM-DD"),
    };

    try {
      const userUpdateResponse = await userApi.update(accountID, updatedData);
      const data = await userUpdateResponse.data;
      const updatedUser = {
        ...user,
        ...data.data,
        fullname: values.fullname || data.data?.fullname || user?.fullname,
        email: values.email || data.data?.email || user?.email,
        phone_number: values.phone || data.data?.phone_number || user?.phone_number,
        dateOfBirth: values.birthDate?.format("YYYY-MM-DD") || data.data?.dateOfBirth || user?.dateOfBirth,
      };

      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      message.success("Cập nhật thành công!");
      setIsEditing(false);
    } catch (error) {
      message.error(`Cập nhật thất bại: ${error.message}`);
      setIsEditing(false);
    }
  };

  const renderAccountProfile = () => (
    <>
      <h3 className="mb-4 text-lg font-bold text-gray-800">Hồ sơ của tôi</h3>
      <hr className="mt-2 border-gray-300" />
      <div className="flex m-4 flex-col gap-6 md:flex-row md:gap-8">
        <div className="w-full md:w-1/2">
          <Form form={form} layout="vertical" className="space-y-4" onFinish={onFinish}>
            <Item name="fullname" label={<span className="text-base font-semibold">Họ và tên</span>}>
              <Input className="rounded border border-gray-300 p-2" disabled={!isEditing} />
            </Item>
            <Item name="email" label={<span className="text-base font-semibold">Email</span>}>
              <Input className="rounded border border-gray-300 p-2" disabled={!isEditing} />
            </Item>
            <Item name="phone" label={<span className="text-base font-semibold">Số điện thoại</span>}>
              <Input placeholder="Nhập số điện thoại" className="rounded border border-gray-300 p-2" disabled={!isEditing} />
            </Item>
            <Item name="birthDate" label={<span className="text-base font-semibold">Ngày sinh</span>}>
              <DatePicker
                placeholder="Chọn ngày sinh"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[#22A6DF]"
                disabled={!isEditing}
                format="DD-MM-YYYY"
              />
            </Item>
            {isEditing && (
              <Item>
                <Button htmlType="submit" className="w-1/4 bg-[#22A6DF] hover:bg-[#1890ff] rounded text-white mr-2">Lưu</Button>
                <Button className="w-1/4 bg-gray-300 hover:bg-gray-400 rounded text-gray-700" onClick={handleCancel}>Hủy</Button>
              </Item>
            )}
          </Form>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
          <Avatar size={120} src={user?.avatar || "/images/avatar/avatar1.png"} />
          <Upload>
            <Button
              icon={<UploadOutlined />}
              className="bg-[#22A6DF] text-white hover:bg-[#1890ff] rounded my-3"
              disabled={!isEditing}
            >
              Chọn
            </Button>
          </Upload>
          <p className="text-xs text-gray-500 text-center">Dung lượng file tối đa: 1MB <br /> Định dạng: JPG, PNG</p>
        </div>
      </div>
    </>
  );

  // Fetch danh sách tỉnh/thành phố
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((error) => {
        console.error("Lỗi khi fetch tỉnh:", error);
        message.error("Không thể tải danh sách tỉnh!");
      });
  }, []);

  // Fetch danh sách quận/huyện khi chọn tỉnh
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

  // Fetch danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
          addressForm.setFieldsValue({ ward: null });
        })
        .catch((error) => {
          console.error("Lỗi khi fetch phường/xã:", error);
          message.error("Không thể tải danh sách phường/xã!");
        });
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Hàm xử lý modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    addressForm
      .validateFields()
      .then(async (values) => {
        const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();
        if (!accountID || !user) {
          message.error("Không tìm thấy thông tin người dùng!");
          return;
        }
  
        // Tìm tên tỉnh, quận, phường từ danh sách đã fetch
        const provinceName = provinces.find(p => p.code === values.province)?.name || '';
        const districtName = districts.find(d => d.code === values.district)?.name || '';
        const wardName = wards.find(w => w.code === values.ward)?.name || '';
  
        // Ghép chuỗi địa chỉ đầy đủ
        const fullAddress = `${values.address}, ${wardName}, ${districtName}, ${provinceName}`.trim();
  
        // Tạo địa chỉ mới từ dữ liệu form
        const newAddress: Address = {
          name: values.name,
          phone: values.phone,
          address: fullAddress, // Chuỗi địa chỉ đầy đủ
        };
  
        try {
          // Gọi API để thêm địa chỉ mới
          const userUpdateResponse = await userApi.addAddress(accountID, newAddress);
          const data = await userUpdateResponse.data;
  
          // Cập nhật state user với dữ liệu mới
          const updatedAddresses = [...(user.address || []), newAddress];
          const updatedUser = {
            ...user,
            address: updatedAddresses,
          };
          setUser(updatedUser);
          localStorage.setItem("userData", JSON.stringify(updatedUser));
  
          // Đóng modal và reset form
          setIsModalVisible(false);
          addressForm.resetFields();
          setSelectedProvince(null);
          setSelectedDistrict(null);
          setDistricts([]);
          setWards([]);
          message.success("Thêm địa chỉ thành công!");
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
          message.error(`Thêm địa chỉ thất bại: ${errorMessage}`);
          console.log("Dữ liệu gửi lên API:", newAddress);
          console.error("Lỗi từ server:", error);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    addressForm.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
  };

  const renderAddressProfile = () => (
    <>
      <div className="flex justify-between">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Địa chỉ của tôi</h3>
        <Button
          className="w-1/6 bg-[#22A6DF] hover:bg-[#1890ff] hover:border-[#22A6DF] rounded text-white"
          onClick={showModal}
        >
          + Thêm địa chỉ
        </Button>
      </div>

      <hr className="mt-2 border-gray-300" />

      
      <div className="m-4 flex justify-between items-center gap-6">
        <div className="w-full max-w-md text-center">
          <p className="text-base font-semibold">
            Hoàng Thái Thuận <span className="mx-2 text-gray-500">|</span>{" "}
            <span className="font-normal text-gray-500">(+84) 0393153129</span>
          </p>
          <p className="mt-2 text-base text-gray-500">
            416, Đường Quýng Hâm, phường 5, quận Gò Vấp, TP. Hồ Chí Minh
          </p>
        </div>
        <Button
          className="w-1/7 bg-[#22A6DF] hover:bg-[#1890ff] rounded text-white"
          onClick={() => onFinish(form.getFieldsValue())}
        >
          Cập nhật
        </Button>
      </div>

      {/* Modal thêm địa chỉ */}
      <Modal
        title="Thêm địa chỉ mới"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancelModal}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#22A6DF] hover:bg-[#1890ff] text-white" }}
        cancelButtonProps={{ className: "bg-gray-300 hover:bg-gray-400 text-gray-700" }}
      >
        <Form form={addressForm} layout="vertical" className="space-y-4">
          <Item
            name="name"
            label={<span className="text-base font-semibold">Họ và tên</span>}
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              placeholder="Nhập họ và tên"
              className="rounded border border-gray-300 p-2"
            />
          </Item>
          <Item
            name="phone"
            label={<span className="text-base font-semibold">Số điện thoại</span>}
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input
              placeholder="Nhập số điện thoại"
              className="rounded border border-gray-300 p-2"
            />
          </Item>
          <Item
            name="province"
            label={<span className="text-base font-semibold">Tỉnh/Thành phố</span>}
            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              className="rounded border border-gray-300"
              showSearch
              optionFilterProp="children"
              onChange={(value) => setSelectedProvince(value)}
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
            label={<span className="text-base font-semibold">Quận/Huyện</span>}
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
          >
            <Select
              placeholder="Chọn quận/huyện"
              className="rounded border border-gray-300"
              showSearch
              optionFilterProp="children"
              disabled={!selectedProvince}
              onChange={(value) => setSelectedDistrict(value)}
            >
              {districts.map((district) => (
                <Select.Option key={district.code} value={district.code}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Item>
          <Item
            name="ward"
            label={<span className="text-base font-semibold">Phường/Xã</span>}
            rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
          >
            <Select
              placeholder="Chọn phường/xã"
              className="rounded border border-gray-300"
              showSearch
              optionFilterProp="children"
              disabled={!selectedDistrict}
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
            label={<span className="text-base font-semibold">Địa chỉ nhà</span>}
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ nhà!" }]}
          >
            <Input
              placeholder="Nhập địa chỉ nhà"
              className="rounded border border-gray-300 p-2"
            />
          </Item>
        </Form>
      </Modal>
    </>
  );

  const renderChangePassword = () => (
    <>
      <h3 className="mb-4 text-lg font-bold text-gray-800">Đổi mật khẩu</h3>
      <hr className="mt-2 border-gray-300" />
      <div className="flex m-4 flex-col gap-6 md:flex-row md:gap-8">
        <div className="w-full md:w-1/2">
          <Form form={form} layout="vertical" className="space-y-4" onFinish={onFinish}>
            <Item
              name="currentPassword"
              label={<span className="text-base font-semibold">Mật khẩu hiện tại</span>}
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu hiện tại" className="rounded border border-gray-300 p-2" />
            </Item>
            <Item
              name="newPassword"
              label={<span className="text-base font-semibold">Mật khẩu mới</span>}
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" className="rounded border border-gray-300 p-2" />
            </Item>
            <Item
              name="confirmPassword"
              label={<span className="text-base font-semibold">Nhập lại mật khẩu mới</span>}
              rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" className="rounded border border-gray-300 p-2" />
            </Item>
            <Item>
              <Button htmlType="submit" className="w-1/3 bg-[#22A6DF] hover:bg-[#1890ff] rounded text-white">Cập nhật</Button>
            </Item>
          </Form>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center" />
      </div>
    </>
  );

  const renderFormContent = () => {
    switch (type) {
      case "account": return renderAccountProfile();
      case "address": return renderAddressProfile();
      case "change-password": return renderChangePassword();
      default: return <div>Trang không tồn tại</div>;
    }
  };

  return (
    <div className="flex my-6 flex-col gap-6 md:flex-row md:gap-8 sm:px-[40px] lg:px-[154px]">
      <Card className="w-full md:w-1/4 border-none" styles={{ body: { padding: 0 } }}>
        <div className="mb-4 flex items-center gap-4">
          <Avatar size={75} src={user?.avatar || "/images/avatar/avatar1.png"} />
          <div>
            <h2 className="text-lg font-bold text-gray-800">{user?.fullname}</h2>
            <p className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:underline" onClick={handleEdit}>
              <FaEdit /> Sửa hồ sơ
            </p>
          </div>
        </div>
        <div className="space-y-2 text-lg text-gray-600">
          <div className="flex items-center gap-2">
            <FaUser className="text-[#22A6DF]" /> Tài khoản của tôi
          </div>
          <div className={`ml-7 cursor-pointer ${type === "account" ? "text-[#22A6DF]" : "text-gray-600"}`} onClick={() => (window.location.href = "/userprofile/account")}>Hồ sơ</div>
          <div className={`ml-7 cursor-pointer ${type === "address" ? "text-[#22A6DF]" : "text-gray-600"}`} onClick={() => (window.location.href = "/userprofile/address")}>Địa chỉ</div>
          <div className={`ml-7 cursor-pointer ${type === "change-password" ? "text-[#22A6DF]" : "text-gray-600"}`} onClick={() => (window.location.href = "/userprofile/change-password")}>Đổi mật khẩu</div>
          <div className="flex items-center gap-2">
            <FaMoneyCheckAlt className="text-[#22A6DF]" /> Đơn mua
          </div>
        </div>
      </Card>
      <Card className="w-full md:w-3/4 rounded-lg border border-gray-200 shadow-md">{renderFormContent()}</Card>
    </div>
  );
}