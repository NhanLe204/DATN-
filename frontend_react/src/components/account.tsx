"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Button, Form, Input, Upload, message } from "antd";
import { DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import userApi from "../api/userApi";

const { Item } = Form;

interface User {
    _id: string;
    email: string;
    fullname: string;
    password: string;
    phone_number: string;
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

export default function Account() {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

      if (!token || !accountID) {
        setUser(null);
        return;
      }

      try {
        const userResponse = await userApi.getUserById(accountID);
        setUser(userResponse.data.data);
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
    setFileList([]);
  };

  const onFinish = async (values) => {
    const token = localStorage.getItem("accessToken");
    const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

    if (!token || !accountID) {
      message.error("Thiếu token hoặc accountID!");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", values.fullname || "");
    formData.append("email", values.email || "");
    formData.append("phone_number", values.phone || "");
    formData.append("dateOfBirth", values.birthDate?.format("YYYY-MM-DD") || "");

        if (fileList.length > 0) {
            const file = fileList[0].originFileObj;
            if (!file) {
                message.error("Vui lòng chọn file để upload!");
                return;
            }

            if (file.size > 1024 * 1024) {
                message.error("Dung lượng file tối đa là 1MB!");
                return;
            }

            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                message.error("Chỉ hỗ trợ định dạng JPG, PNG!");
                return;
            }

            formData.append("avatar", file);
        }

    setUploading(true);

        try {
            const userUpdateResponse = await userApi.update(accountID, formData);
            const data = userUpdateResponse.data;
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
            setFileList([]);
            window.location.reload();
        } catch (error) {
            message.error(`Cập nhật thất bại: ${error.message}`);
        }
    };

    const validatePhoneNumber = (_: any, value: string) => {
        const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
        if (value && !phoneRegex.test(value)) {
            return Promise.reject(new Error('Số điện thoại không hợp lệ! Phải bắt đầu bằng 03, 05, 07, 08, 09 và đủ 10 số.'));
        }
        return Promise.resolve();
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file: any) => {
            setFileList([file]);
            return false;
        },
        fileList,
        onChange: (info: any) => {
            let newFileList = [...info.fileList];
            newFileList = newFileList.slice(-1);
            setFileList(newFileList);
        },
    };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="w-full md:w-1/2">
        <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
          <Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input className="rounded border border-gray-300 p-2" />
          </Item>
          <Item name="email" label="Email">
            <Input className="rounded border border-gray-300 p-2" disabled />
          </Item>
          <Item name="phone" label="Số điện thoại">
            <Input className="rounded border border-gray-300 p-2" />
          </Item>
          <Item name="birthDate" label="Ngày sinh">
            <DatePicker className="w-full rounded border border-gray-300 p-2" format="DD-MM-YYYY" />
          </Item>
          <Item>
            <Button
              htmlType="submit"
              className="bg-[#22A6DF] text-white hover:bg-[#1890ff] rounded px-4 py-2"
              loading={uploading}
            >
              Lưu
            </Button>
            <Button
              className="ml-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded px-4 py-2"
              onClick={handleCancel}
              disabled={uploading}
            >
              Hủy
            </Button>
          </Item>
        </Form>
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <Avatar size={120} src={user?.avatar || "/images/avatar/avatar1.png"} />
        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            className="bg-[#22A6DF] text-white hover:bg-[#1890ff] rounded mt-4"
          >
            Chọn ảnh
          </Button>
        </Upload>
        <p className="text-sm text-gray-500 mt-2">Dung lượng tối đa: 1MB. Định dạng: JPG, PNG.</p>
      </div>
    </div>
  );
}