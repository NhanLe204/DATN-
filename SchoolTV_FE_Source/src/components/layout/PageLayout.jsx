import React from "react";
import Header from "../header";
import { Outlet } from "react-router-dom";
import Footer from "../Footer";

function PageLayout() {
  return (
    <>
      <p>dsadasdasdasdas</p>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default PageLayout;
