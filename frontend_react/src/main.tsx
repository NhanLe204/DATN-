import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App"; // Import App từ App.js
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import ENV_VARS from "../config";

import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
dayjs.locale('vi');
import { ConfigProvider } from 'antd';

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    // <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={ENV_VARS.VITE_GOOGLE_CLIENT_ID}>
        <ConfigProvider locale={viVN}>
          <App />
        </ConfigProvider>
      </GoogleOAuthProvider>
    </Provider>
    // </StrictMode>
  );
} else {
  console.error("Root element not found");
}
