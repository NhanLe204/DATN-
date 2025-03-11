
import React from "react";
import { SearchProvider } from "../searchContext";

import Header from "../header";
import { Outlet } from "react-router-dom";
import Footer from "../footer";

function PageLayout() {
  return (
    <>
      <SearchProvider>
        <Header />
        <Outlet />
        <Footer />
      </SearchProvider>
    </>
  );
}

export default PageLayout;
