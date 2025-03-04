import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <GoogleOAuthProvider clientId="518751281700-f8vq0pf1792lcv7risc93qd5b6ccb70g.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  );
} else {
  console.error("Root element not found");
}
