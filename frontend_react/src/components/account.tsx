"use client";
import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Form,
    Input,
    Upload,
    message,
} from "antd";
import { DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import userApi from "../api/userApi";

const { Item } = Form;

interface User {
    _id: string;
    email: string;
    fullname: string;
    password: string;
    phone_number: string;
    //   address: Address[];
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

interface AccountProps {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export default function Account({ isEditing, setIsEditing }: AccountProps) {
    const params = useParams();
    const type = params["*"] || "account";
    const [form] = Form.useForm();
    const [user, setUser] = useState<User | null>(null);

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
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            message.error(`Cập nhật thất bại: ${error.message}`);
            setIsEditing(false);
        }
    };

    return (
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
    )
}