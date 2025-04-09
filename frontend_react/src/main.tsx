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
        <GoogleOAuthProvider clientId="400713217692-u7ph0n1jr292e0adcb5fc2lahdc6iv6j.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}