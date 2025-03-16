"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Button, Card, Form, Input, Modal, Select, Upload, message } from "antd";
import { DatePicker } from "antd";
import { FaUser, FaMoneyCheckAlt, FaEdit, FaTrash } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import ENV_VARS from "../../../config";

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
    id?: string;
    name: string;
    phone: string;
    address: string;
    provinceId?: string;
    districtId?: string;
    wardId?: string;
}


export default function UserProfile() {
    const params = useParams();
    const type = params["*"] || "account";
    const [form] = Form.useForm();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const accountID = localStorage.getItem("accountID")?.replace(/"/g, "").trim();

        if (!token || !accountID) {
            setUser(null);
            return;
        }

        fetch(`${ENV_VARS.VITE_API_URL}/api/v1/users/${accountID}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data.data) {
                    setUser(data.data);
                    localStorage.setItem("userData", JSON.stringify(data.data));
                } else {
                    setUser(null);
                    localStorage.removeItem("userData");
                }
            })
            .catch(() => setUser(null));
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
            const response = await fetch(`${ENV_VARS.VITE_API_URL}/api/v1/users/${accountID}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();
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

    const renderAddressProfile = () => (
        <>
            <div className="flex justify-between">
                <h3 className="mb-4 text-lg font-bold text-gray-800">Địa chỉ của tôi</h3>
                <Button
                    className="w-1/6 bg-[#22A6DF] hover:bg-[#1890ff] hover:border-[#22A6DF] rounded text-white"
                    onClick={() => console.log("+ Thêm địa chỉ")}
                >
                    + Thêm địa chỉ
                </Button>
            </div>

            <hr className="mt-2 border-gray-300" />

            <div className="m-4 flex justify-between items-center gap-6">
                <div className="w-full max-w-md text-center">
                    <p className="text-base font-semibold">
                        Hoàng Thái Thuận <span className="mx-2 text-gray-500">|</span> <span className="font-normal text-gray-500">(+84) 0393153129</span>
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