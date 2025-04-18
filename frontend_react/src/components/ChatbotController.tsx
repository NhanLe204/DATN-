import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ChatbotController = () => {
  const location = useLocation();
  // Danh sách các route muốn hiển thị chatbot
  const allowedRoutes = [
    "/",
    "/product",
    "/service",
    "/contact",
    "/info",
    "/about-us",
    "/detail/:id",
  ];

  useEffect(() => {
    const chatbotElement = document.querySelector(".preny-open") as HTMLElement;
    console.log(chatbotElement, "SS");

    // Kiểm tra xem phần tử có tồn tại không
    if (chatbotElement) {
      // Hỗ trợ route động như /detail/:id
      const isAllowed = allowedRoutes.some(
        (route) =>
          route === location.pathname ||
          (route.includes(":") &&
            location.pathname.match(
              new RegExp(`^${route.replace(/:id/, "[^/]+")}$`)
            ))
      );

      chatbotElement.style.display = isAllowed ? "block" : "none";
    }
  }, [location.pathname]); // Chạy lại khi route thay đổi

  return null;
};

export default ChatbotController;
