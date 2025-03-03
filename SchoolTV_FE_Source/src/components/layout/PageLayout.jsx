import React from "react";
import Header from "../header";
import { Outlet } from "react-router-dom";
import Footer from "../footer";

function PageLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default PageLayout;
