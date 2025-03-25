

import React from "react";
import { SearchProvider } from "../searchContext";

import {} from "react";


import Header from "../header";
import { Outlet } from "react-router-dom";
import Footer from "../footer";
import Navigation from "../navigation";
function PageLayout() {
  return (
    <>
      <SearchProvider>
        <Header />
        <Navigation></Navigation>
        <Outlet />
        <Footer />
      </SearchProvider>
    </>
  );
}

export default PageLayout;
