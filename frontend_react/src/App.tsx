import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import Contact from "./pages/contact/contact";
// import infoservices from "./pages/infoservices/infoservices";
function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/signup",
      element: (
        <>
          <SignUp />
        </>
      ),
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "", element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "employees", element: <EmployeeList /> },
        { path: "categories", element: <CategoryList /> },
        { path: "products", element: <ProductList /> },
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
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/contact",
          element: <ContactPage />,
        },
        {
          path: "/checkout",
          element: <Payment />,
        },
        {
          path: "/product",
          element: <Products />,
        },
        {
          path: "/detail/:id",
          element: <DetailProduct />,
        },
        {
          path: "/info",
          element: <PetSpaServices />,
        },
        {
          path: "/service",
          element: <SpaBookingForm />,
        },
        {
          path: "/cart",
          element: <Cart />,
        },
        {
          path: "/checkout",
          element: <Payment />,
        },
        {
          path: "/about-us",
          element: <AboutUs />,
        },

        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/userprofile/*",
          element: <UserProfile />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
