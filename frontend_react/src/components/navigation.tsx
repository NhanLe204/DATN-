import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import { useLocation, Link, useParams } from "react-router-dom";
import { Typography } from "antd";
import productsApi from "../api/productsApi"; // Import API

const { Title } = Typography;

// Mapping cho các trang admin
const adminPageNameMapping: { [key: string]: string } = {
  admin: "Admin",
  dashboard: "Dashboard",
  categories: "Quản lý danh mục",
  blogcategories: "Quản lý danh mục bài viết",
  products: "Quản lý sản phẩm",
  blogs: "Quản lý bài viết",
  brands: "Quản lý thương hiệu",
  tags: "Quản lý tags",
  employees: "Quản lý nhân viên",
  orders: "Quản lý đơn hàng",
  services: "Quản lý dịch vụ",
  users: "Quản lý người dùng",
  settings: "Cài đặt hệ thống",
  posts: "Quản lý bài viết",
  bookings: "Quản lí lịch hẹn",
};

// Mapping cho các trang công khai
const publicPageNameMapping: { [key: string]: string } = {
  "": "Trang chủ",
  product: "Sản phẩm",
  contact: "Liên hệ",
  detail: "Chi tiết sản phẩm",
  info: "Dịch vụ Spa",
  "about-us": "Về chúng tôi",
  service: "Đặt lịch Spa",
  cart: "Giỏ hàng",
  checkout: "Thanh toán",
  userprofile: "Hồ sơ người dùng",
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const { id } = useParams<{ id: string }>();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isDetailPage = location.pathname.startsWith("/detail");

  const [product, setProduct] = useState<{
    name: string;
    category_id: { name: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch thông tin sản phẩm khi vào trang chi tiết
  useEffect(() => {
    if (isDetailPage && id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await productsApi.getProductByID(id);
          console.log("API Response:", response); // Debug dữ liệu API trả về
          // Truy cập đúng cấu trúc response.data.product
          setProduct(response.data.product);
        } catch (err) {
          setError("Không thể tải thông tin sản phẩm");
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isDetailPage]);

  // Không hiển thị breadcrumb ở trang Dashboard hoặc Trang chủ
  if (
    location.pathname === "/admin" ||
    location.pathname === "/admin/dashboard" ||
    location.pathname === "/"
  ) {
    return null;
  }

  // Hiển thị loading hoặc lỗi
  if (isDetailPage && loading) return <div>Đang tải...</div>;
  if (isDetailPage && error) return <div>{error}</div>;

  // Hàm lấy tên hiển thị từ mapping
  const getDisplayName = (name: string) => {
    if (isAdminPage) {
      return (
        adminPageNameMapping[name.toLowerCase()] ||
        name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ")
      );
    } else {
      return (
        publicPageNameMapping[name.toLowerCase()] ||
        name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ")
      );
    }
  };

  // Tên trang hiện tại
  const currentPageName =
    isDetailPage && product
      ? product.name
      : getDisplayName(pathnames[pathnames.length - 1] || "");

  // Layout cho trang admin
  const adminLayout = (
    <div
      style={{
        background: "#fff",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        marginBottom: "16px",
      }}
    >
      <Breadcrumb style={{ marginBottom: "8px" }} separator=">">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          return last ? (
            <Breadcrumb.Item key={to} style={{ color: "#000" }}>
              {getDisplayName(value)}
            </Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={to}>
              <Link to={to} style={{ color: "#8c8c8c" }}>
                {getDisplayName(value)}
              </Link>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
      <Title level={3} style={{ margin: 0, color: "#000" }}>
        {currentPageName}
      </Title>
    </div>
  );

  // Layout cho trang công khai
  const publicLayout = (
    <div className="px-[154px] py-4 text-base">
      <Breadcrumb separator="/">
        <Breadcrumb.Item>
          <Link to="/">Trang chủ</Link>
        </Breadcrumb.Item>
        {isDetailPage ? (
          product ? (
            <>
              <Breadcrumb.Item>
                <Link to="/product" style={{ color: "#8c8c8c" }}>
                  {product.category_id?.name || "Danh mục không xác định"}
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item style={{ color: "#000" }}>
                {product.name}
              </Breadcrumb.Item>
            </>
          ) : (
            <Breadcrumb.Item style={{ color: "#000" }}>
              Chi tiết sản phẩm
            </Breadcrumb.Item>
          )
        ) : (
          pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const displayName = getDisplayName(value);

            return last ? (
              <Breadcrumb.Item key={to} style={{ color: "#000" }}>
                {displayName}
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item key={to}>
                <Link to={to} style={{ color: "#8c8c8c" }}>
                  {displayName}
                </Link>
              </Breadcrumb.Item>
            );
          })
        )}
      </Breadcrumb>
    </div>
  );

  return isAdminPage ? adminLayout : publicLayout;
};

export default Navigation;
