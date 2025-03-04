"use client";
import React, { useState } from "react";
import { Avatar, Button, Card, Form, Input, Radio, Select, Upload, message } from "antd";
import { FaUser, FaMoneyCheckAlt, FaUpload, FaEdit } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom"; // Sử dụng useParams để lấy route

const { Item } = Form;
const { Option } = Select;

export default function UserProfile() {
    const params = useParams(); // Lấy route hiện tại từ URL
    const type = params["*"] || "account"; // Lấy phần route con (ví dụ: "account", "address", v.v.)

    const [form] = Form.useForm();

    // Hàm xử lý submit chung
    const onFinish = (values) => {
        console.log(`Submit ${type} form:`, values);
    };


    // Nội dung form dựa trên type
    const renderFormContent = () => {
        switch (type) {
            case "account":
                return (
                    <>
                        <h3 className="mb-4 text-lg font-bold text-gray-800">Hồ sơ của tôi</h3>
                        <hr className="mt-2 border-gray-300" />
                        <div className="flex m-4 flex-col gap-6 md:flex-row md:gap-8">
                          
                            <div className="w-full md:w-1/2">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={{}}
                                    className="space-y-4"
                                >
                                    <Item
                                        name="fullname"
                                        label={<span className="text-base font-semibold">Họ và tên</span>}
                                    // rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                                    >
                                        <Input placeholder="Hoàng Thái Thuận" className="rounded border border-gray-300 p-2" />
                                    </Item>

                                    <Item
                                        name="email"
                                        label={<span className="text-base font-semibold">Email</span>}
                                    // rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" }]}
                                    >
                                        <Input placeholder="hoangthaithuan07@gmail.com" disabled className="rounded border border-gray-300 p-2 bg-gray-100 cursor-not-allowed" />
                                    </Item>

                                    <Item
                                        name="phone"
                                        label={<span className="text-base font-semibold">Số điện thoại</span>}
                                    // rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                                    >
                                        <Input placeholder="0393***129" className="rounded border border-gray-300 p-2" />
                                    </Item>

                                    <Item
                                        name="gender"
                                        label={<span className="text-base font-semibold">Giới tính</span>}
                                    // rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                                    >
                                        <Radio.Group
                                            value="Nam"
                                            className="flex gap-4"
                                        >
                                            <Radio value="Nam" className="text-sm text-gray-700">Nam</Radio>
                                            <Radio value="Nữ" className="text-sm text-gray-700">Nữ</Radio>
                                            <Radio value="Khác" className="text-sm text-gray-700">Khác</Radio>
                                        </Radio.Group>
                                    </Item>

                                    <Item
                                        name="birthDate"
                                        label={<span className="text-base font-semibold">Ngày sinh</span>}
                                    // rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                                    >
                                        <input
                                            type="date"
                                            value=""
                                            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22A6DF]"
                                            placeholder="Chọn ngày sinh"
                                        />
                                    </Item>

                                    <Item>
                                        <Button
                                            htmlType="submit"
                                            className="w-1/3 bg-[#22A6DF] hover:bg-[#1890ff] hover:border-[#22A6DF] rounded text-white"
                                            onClick={() => onFinish(form.getFieldsValue())}
                                        >
                                            Lưu
                                        </Button>
                                    </Item>
                                </Form>
                            </div>

                            <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
                                <Avatar
                                    size={120}
                                    src="/images/avatar/avatar1.png"
                                />
                                <Upload>
                                    <Button icon={<UploadOutlined />} className="bg-[#22A6DF] text-white hover:bg-[#1890ff] hover:border-[#22A6DF] rounded my-3">
                                        Chọn
                                    </Button>
                                </Upload>
                                <p className="text-xs text-gray-500 text-center">
                                    Dung lượng file tối đa: 1MB <br />
                                    Định dạng: JPG, PNG
                                </p>
                            </div>
                        </div>
                    </>
                );
            case "address":
                return (
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
            case "bank":
                return (
                    <>
                        <div className="flex justify-between">
                            <h3 className="mb-4 text-lg font-bold text-gray-800">Thẻ tín dụng/ ghi nợ</h3>
                            <Button
                                className="w-1/6 bg-[#22A6DF] hover:bg-[#1890ff] hover:border-[#22A6DF] rounded text-white"
                                onClick={() => console.log("+ Thêm địa chỉ")}
                            >
                                + Thêm thẻ mới
                            </Button>
                        </div>

                        <hr className="mt-2 border-gray-300" />

                        <div className="m-4 flex justify-between items-center gap-6">
                            <div className="w-full max-w-md text-left">
                                <p className="text-base text-gray-800 flex items-center gap-10">
                                    <img src="/images/paymentmethod/visa.png" alt="" className="h-10" /> <span className="font-semibold">VISA</span> <span className="ml-2">**** **** **** 6128</span>
                                </p>
                            </div>
                            <div className="flex justify-center gap-4">
                                <Button
                                    danger
                                    className="w-1/7 bg-red-500 hover:bg-red-600 rounded text-red-600"
                                    onClick={() => console.log("Xóa thẻ")}
                                >
                                    Xóa
                                </Button>
                                <Button
                                    className="w-1/7 bg-[#22A6DF] hover:bg-[#1890ff] rounded text-white"
                                    onClick={() => onFinish(form.getFieldsValue())}
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        </div>
                    </>
                );
            case "change-password":
                return (
                    <>
                        <h3 className="mb-4 text-lg font-bold text-gray-800">Đổi mật khẩu</h3>

                        <hr className="mt-2 border-gray-300" />

                        <div className="flex m-4 flex-col gap-6 md:flex-row md:gap-8">
                            <div className="w-full md:w-1/2">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={{}}
                                    className="space-y-4"
                                >
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
                                        <Button
                                            htmlType="submit"
                                            className="w-1/3 bg-[#22A6DF] hover:bg-[#1890ff] rounded text-white"
                                            onClick={() => onFinish(form.getFieldsValue())}
                                        >
                                            Cập nhật
                                        </Button>
                                    </Item>
                                </Form>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
                                {/* Không có nội dung bên phải cho trang này */}
                            </div>
                        </div>
                    </>
                );
            default:
                return <div>Trang không tồn tại</div>;
        }
    };

    return (
        <div className="flex my-6 flex-col justify-between gap-6 md:flex-row md:gap-8 sm:px-[40px] lg:px-[154px]">
            <Card className="w-full md:w-1/4 border-none" styles={{ body: { padding: 0 } }}>
                <div className="mb-4 flex items-center gap-4 sm:items-center md:items-center">
                    <Avatar
                        size={75}
                        src="/images/avatar/avatar1.png"
                    />
                    <div>
                        <h2 className="text-lg lg:text-sm font-bold text-gray-800">Hoàng Thái Thuận</h2>
                        <p className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:underline">
                            <FaEdit /> Sửa hồ sơ
                        </p>
                    </div>
                </div>
                <div className="space-y-2 text-lg lg:text-base text-gray-600">
                    <div className="flex items-center gap-2 sm:items-center">
                        <FaUser className="text-[#22A6DF]" /> Tài khoản của tôi
                    </div>
                    <div
                        className={`sm:items-center ml-7 cursor-pointer ${type === "account" ? "text-[#22A6DF]" : "text-gray-600"}`}
                        onClick={() => window.location.href = "/userprofile/account"}
                    >
                        Hồ sơ
                    </div>
                    <div 
                        className={`sm:items-center ml-7 cursor-pointer ${type === "address" ? "text-[#22A6DF]" : "text-gray-600"}`}
                        onClick={() => window.location.href = "/userprofile/address"}
                    >
                        Địa chỉ
                    </div>
                    <div 
                        className={`sm:items-center ml-7 cursor-pointer ${type === "bank" ? "text-[#22A6DF]" : "text-gray-600"}`}
                        onClick={() => window.location.href = "/userprofile/bank"}
                    >
                        Ngân hàng
                    </div>
                    <div 
                        className={`sm:items-center ml-7 cursor-pointer ${type === "change-password" ? "text-[#22A6DF]" : "text-gray-600"}`} 
                        onClick={() => window.location.href = "/userprofile/change-password"}
                    >
                        Đổi mật khẩu
                    </div>
                    <div className="flex items-center gap-2 sm:items-center">
                        <FaMoneyCheckAlt className="text-[#22A6DF]" /> Đơn mua
                    </div>
                </div>
            </Card>
            <Card className="w-full md:w-3/4 rounded-lg border border-gray-200 shadow-md">
                {renderFormContent()}
            </Card>
        </div>
    );
}