import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Divider } from "antd";
import {
  UserOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  IdcardOutlined,
  FileTextOutlined,
  ToolOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import React from "react";
import Navigation from "../navigation";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const today = new Date();
      const weekday = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const day = weekday[today.getDay()];

      let dd = today.getDate().toString();
      let mm = (today.getMonth() + 1).toString();
      const yyyy = today.getFullYear();
      const h = today.getHours();
      const m = today.getMinutes().toString().padStart(2, "0");
      const s = today.getSeconds().toString().padStart(2, "0");

      if (parseInt(dd) < 10) dd = "0" + dd;
      if (parseInt(mm) < 10) mm = "0" + mm;

      const dateStr = `${day}, ${dd}/${mm}/${yyyy}`;
      const timeStr = `${h} giờ ${m} phút ${s} giây`;

      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "1":
        navigate("/admin/dashboard");
        break;
      case "2":
        navigate("/admin/categories");
        break;
      case "3":
        navigate("/admin/products");
        break;
      case "4":
        navigate("/admin/brands");
        break;
      case "5":
        navigate("/admin/tags");
        break;
      case "6":
        navigate("/admin/employees");
        break;
      case "7":
        navigate("/admin/orders");
        break;
      case "8":
        navigate("/admin/services");
        break;
      case "9":
        navigate("/admin/users");
        break;
      case "10":
        navigate("/admin/settings");
        break;
      default:
        break;
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("accountId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-md"
      >
        <div className="p-4 flex items-center space-x-2">
          <Avatar
            size={40}
            src="https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png"
          />
          {!collapsed && (
            <div>
              <Text strong className="block">
                Admin
              </Text>
              <Text className="text-xs text-gray-500">
                Chào mừng bạn trở lại
              </Text>
            </div>
          )}
        </div>
        <Divider className="my-1" />
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={["1"]}
          onClick={handleMenuClick}
          className="border-r-0"
          items={[
            { key: "1", icon: <PieChartOutlined />, label: "Dashboard" },
            { key: "2", icon: <AppstoreOutlined />, label: "Quản lý danh mục" },
            { key: "3", icon: <ShoppingOutlined />, label: "Quản lý sản phẩm" },
            { key: "4", icon: <ShoppingOutlined />, label: "Quản lý thương hiệu" },
            { key: "5", icon: <ShoppingOutlined />, label: "Quản lý tags" },
            { key: "6", icon: <IdcardOutlined />, label: "Quản lý nhân viên" },
            { key: "7", icon: <FileTextOutlined />, label: "Quản lý đơn hàng" },
            { key: "8", icon: <ToolOutlined />, label: "Quản lý dịch vụ" },
            { key: "9", icon: <UserOutlined />, label: "Quản lý người dùng" },
            { key: "10", icon: <SettingOutlined />, label: "Cài đặt hệ thống" },
          ]}
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span>
                {currentDate} - {currentTime}
              </span>
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            />
          </div>
        </Header>
        <Content className="p-6 bg-gray-50">
          <Navigation />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;