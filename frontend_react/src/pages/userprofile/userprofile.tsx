"use client";
import React, { useEffect, useState } from "react";
import { Avatar } from "antd";
import { FaUser, FaMoneyCheckAlt, FaEdit } from "react-icons/fa";
import { MdOutlineRoomService } from "react-icons/md";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import Account from "../../components/account";
import Address from "../../components/address";
import ChangePassword from "../../components/change-password";
import BookingHistory from "../../components/bookingHistory";
import OrderDetail from "../../components/orderDetail";

interface User {
  _id: string;
  email: string;
  fullname: string;
  phone_number: string;
  avatar: string;
}

export default function UserProfile() {
  const params = useParams();
  const type = params["*"] || "account";
  const navigate = useNavigate();
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

  const renderSidebar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 h-fit md:h-full">
      <div className="flex flex-col items-center md:items-start gap-4">
        <Avatar size={75} src={user?.avatar || "/images/avatar/avatar1.png"} />
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-gray-800">{user?.fullname}</h2>
          <p
            className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:underline"
            onClick={() => navigate("/userprofile/account")}
          >
            <FaEdit /> Sửa hồ sơ
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4 text-gray-600">
        <div
          className={`flex items-center gap-2 cursor-pointer ${
            type === "account" ? "text-[#22A6DF]" : "text-gray-600"
          }`}
          onClick={() => navigate("/userprofile/account")}
        >
          <FaUser className="text-[#22A6DF]" /> Hồ sơ
        </div>
        <div
          className={`flex items-center gap-2 cursor-pointer ${
            type === "address" ? "text-[#22A6DF]" : "text-gray-600"
          }`}
          onClick={() => navigate("/userprofile/address")}
        >
          <FaUser className="text-[#22A6DF]" /> Địa chỉ
        </div>
        <div
          className={`flex items-center gap-2 cursor-pointer ${
            type === "change-password" ? "text-[#22A6DF]" : "text-gray-600"
          }`}
          onClick={() => navigate("/userprofile/change-password")}
        >
          <FaUser className="text-[#22A6DF]" /> Đổi mật khẩu
        </div>
        <div
          className={`flex items-center gap-2 cursor-pointer ${
            type === "orders" ? "text-[#22A6DF]" : "text-gray-600"
          }`}
          onClick={() => navigate("/userprofile/orders")}
        >
          <FaMoneyCheckAlt className="text-[#22A6DF]" /> Đơn mua
        </div>
        <div
          className={`flex items-center gap-2 cursor-pointer ${
            type === "bookings" ? "text-[#22A6DF]" : "text-gray-600"
          }`}
          onClick={() => navigate("/userprofile/bookings")}
        >
          <MdOutlineRoomService className="text-[#22A6DF]" /> Lịch đã đặt
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 sm:px-8 lg:px-16 xl:px-24">
      {/* Sidebar */}
      <div className="md:col-span-1 sticky top-4">{renderSidebar()}</div>

      {/* Main Content */}
      <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4 overflow-y-auto max-h-[80vh]">
        <Routes>
          <Route path="account" element={<Account />} />
          <Route path="address" element={<Address />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="orders" element={<OrderDetail />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="*" element={<div>Trang không tồn tại</div>} />
        </Routes>
      </div>
    </div>
  );
}
