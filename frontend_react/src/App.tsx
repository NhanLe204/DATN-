import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Home from "./pages/home/home";
import PageLayout from "./components/layout/PageLayout";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./pages/login/login";
import SignUp from "./pages/signup/signup";
import ContactPage from "./pages/contact/contact";
import Products from "./pages/product/product";
import DetailProduct from "./pages/detail/detail";
import PetSpaServices from "./pages/infoservices/infoservices";
import SpaBookingForm from "./pages/services/services";
import Cart from "./pages/cart/cart";
import UserProfile from "./pages/userprofile/userprofile";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./admin/dashboard/dashboard";
import ProductList from "./admin/product/product";
import CategoryList from "./admin/category/category";
import OrderList from "./admin/order/order";
import UserList from "./admin/user/user";
import ServiceList from "./admin/service/service";
import SystemSettings from "./admin/setting/setting";
import EmployeeList from "./admin/employee/employee";
import Payment from "./pages/payment/payment";
import AboutUs from "./pages/about-us/about-us";
import BrandManager from "./admin/brand/brand";
import TagManager from "./admin/tag/tag";

interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  role: string;
  status: string;
}
// Component bảo vệ route
const ProtectedRoute = ({ children, allowedRole }: { children: JSX.Element; allowedRole?: string }) => {
  const userData = localStorage.getItem("userData");
  const user: User | null = userData ? JSON.parse(userData) : null;

  // Nếu không có user hoặc status không phải "active", chuyển về login
  if (!user || user.status !== "active") {
    return <Navigate to="/login" replace />;
  }

  // Nếu có allowedRole và role không khớp, chuyển về trang chính
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component cho route công khai
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};
function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <PublicRoute><Login /></PublicRoute>,
    },
    {
      path: "/signup",
      element: <PublicRoute><SignUp /></PublicRoute>,
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "employees", element: <EmployeeList /> },
        { path: "categories", element: <CategoryList /> },
        { path: "products", element: <ProductList /> },
        { path: "brands", element: <BrandManager /> },
        { path: "tags", element: <TagManager /> },
        { path: "orders", element: <OrderList /> },
        { path: "services", element: <ServiceList /> },
        { path: "users", element: <UserList /> },
        { path: "settings", element: <SystemSettings /> },
      ],
    },
    {
      path: "",
      element: <PageLayout />,
      children: [
        // Route công khai (không cần đăng nhập)
        { path: "/", element: <PublicRoute><Home /></PublicRoute> },
        { path: "/contact", element: <PublicRoute><ContactPage /></PublicRoute> },
        { path: "/product", element: <PublicRoute><Products /></PublicRoute> },
        { path: "/detail/:id", element: <PublicRoute><DetailProduct /></PublicRoute> },
        { path: "/info", element: <PublicRoute><PetSpaServices /></PublicRoute> },
        { path: "/about-us", element: <PublicRoute><AboutUs /></PublicRoute> },
        { path: "/service", element: <PublicRoute><SpaBookingForm /></PublicRoute> },
        { path: "/cart", element: <PublicRoute><Cart /></PublicRoute> },
        { path: "/checkout", element: <PublicRoute><Payment /></PublicRoute> },

        // Route bảo vệ (yêu cầu đăng nhập và role "user")
        {
          path: "/userprofile/*",
          element: <ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute>,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;