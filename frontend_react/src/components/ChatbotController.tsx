import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ChatbotController = () => {
  const location = useLocation();
  console.log("Đường dẫn:", location.pathname);

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
    let intervalId: NodeJS.Timeout;

    const checkChatbot = () => {
      // Nhắm đến widget hoặc iframe của chatbot
      const chatbotElement = document.querySelector(
        ".preny-widget, .preny-open, .preny-button, .preny-chatbot, #preny-chatbot-container, .chatbot-container, iframe[src*='preny'], [id*='preny'], [class*='preny']"
      ) as HTMLElement;

      // Debug: Log phần tử tìm thấy
      console.log("Phần tử chatbot:", chatbotElement);

      // Nếu không tìm thấy, log thông tin DOM
      if (!chatbotElement) {
        console.log("Không tìm thấy chatbot, kiểm tra DOM...");
        const scriptElement = document.querySelector(
          "[data-preny-bot-id='6801f7b8074da4b350da2204']"
        );
        if (scriptElement) {
          console.log("Script Preny:", scriptElement);
          console.log("Phần tử cha:", scriptElement.parentElement);
          console.log("Phần tử tiếp theo:", scriptElement.nextElementSibling);
          // Tìm tất cả phần tử tiềm năng
          const potentialWidgets = document.querySelectorAll(
            "div, button, iframe, [id*='preny'], [class*='preny']"
          );
          potentialWidgets.forEach((el) => {
            if (
              el.id?.includes("preny") ||
              el.className?.includes("preny") ||
              el.getAttribute("src")?.includes("preny")
            ) {
              console.log("Phần tử tiềm năng:", el);
            }
          });
        }
      }

      if (chatbotElement) {
        // Kiểm tra route có được phép không
        const isAllowed = allowedRoutes.some((route) => {
          if (route.includes(":")) {
            // Xử lý route động như /detail/:id
            const regex = new RegExp(`^${route.replace(/:id/, "[^/]+")}$`);
            return location.pathname.match(regex);
          }
          return route === location.pathname;
        });

        // Hiển thị/ẩn chatbot
        chatbotElement.style.display = isAllowed ? "block" : "none";
        console.log("Được phép:", isAllowed, "Đường dẫn:", location.pathname);

        // Dừng interval khi tìm thấy phần tử
        clearInterval(intervalId);
      }
    };

    // Chạy ngay lập tức
    checkChatbot();

    // Thử lại mỗi 500ms, tối đa 20 giây (tăng thời gian)
    intervalId = setInterval(checkChatbot, 500);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 20000);

    // Dọn dẹp
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return null;
};

export default ChatbotController;
