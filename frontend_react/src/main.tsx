import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App"; // Import App từ App.js
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <GoogleOAuthProvider clientId="518751281700-f8vq0pf1792lcv7risc93qd5b6ccb70g.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}