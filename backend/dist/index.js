"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_js_1 = __importDefault(require("./config/config.js"));
const db_js_1 = require("./database/db.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const category_routes_js_1 = __importDefault(require("./routes/category.routes.js"));
const product_routes_js_1 = __importDefault(require("./routes/product.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const errorHandler_js_1 = require("./middlewares/errorHandler.js");
const brand_routes_js_1 = __importDefault(require("./routes/brand.routes.js"));
const rate_routes_js_1 = __importDefault(require("./routes/rate.routes.js"));
const coupon_routes_js_1 = __importDefault(require("./routes/coupon.routes.js"));
const order_routes_js_1 = __importDefault(require("./routes/order.routes.js"));
const tag_routes_js_1 = __importDefault(require("./routes/tag.routes.js"));
const service_routes_js_1 = __importDefault(require("./routes/service.routes.js"));
const payment_routes_js_1 = __importDefault(require("./routes/payment.routes.js"));
const paymentType_routes_js_1 = __importDefault(require("./routes/paymentType.routes.js"));
const delivery_routes_js_1 = __importDefault(require("./routes/delivery.routes.js"));
const orderDetail_routes_js_1 = __importDefault(require("./routes/orderDetail.routes.js"));
const contact_routes_js_1 = __importDefault(require("./routes/contact.routes.js")); // Import contact router
const blog_routes_js_1 = __importDefault(require("./routes/blog.routes.js"));
const blogCategory_routes_js_1 = __importDefault(require("./routes/blogCategory.routes.js"));
dotenv_1.default.config(); // Đọc file .env
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const app = (0, express_1.default)();
const PORT = config_js_1.default.PORT;
const corsOptions = {
    origin: `${config_js_1.default.FE_URL}`,
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json()); // will allow us to parse req.body
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.get('/', (req, res) => {
    res.send('Hello World1');
});
// Routes
app.use('/api/v1/auth', auth_routes_js_1.default);
app.use('/api/v1', category_routes_js_1.default);
app.use('/api/v1', product_routes_js_1.default);
app.use('/api/v1', user_routes_js_1.default);
app.use('/api/v1', brand_routes_js_1.default);
app.use('/api/v1', rate_routes_js_1.default);
app.use('/api/v1', coupon_routes_js_1.default);
app.use('/api/v1', order_routes_js_1.default);
app.use('/api/v1', tag_routes_js_1.default);
app.use('/api/v1', service_routes_js_1.default);
app.use('/api/v1', paymentType_routes_js_1.default);
app.use('/api/v1', delivery_routes_js_1.default);
app.use('/api/v1', payment_routes_js_1.default);
app.use('/api/v1', orderDetail_routes_js_1.default);
app.use('/api/v1', blog_routes_js_1.default);
app.use('/api/v1', blogCategory_routes_js_1.default);
app.use('/api/v1', contact_routes_js_1.default); // Thêm router contact vào đây
app.use(errorHandler_js_1.errorHandler);
// // Hàm khởi tạo ngrok tunnel
// async function startNgrok() {
//   try {
//     await ngrok.kill(); // Tắt mọi session cũ trước khi khởi tạo mới
//     const listener = await ngrok.connect({
//       addr: PORT,
//       authtoken: process.env.NGROK_AUTH_TOKEN
//     });
//     console.log(`Ngrok tunnel created: ${listener.url()}`);
//   } catch (error) {
//     console.error('Error creating ngrok tunnel:', error);
//   }
// }
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    (0, db_js_1.connectDB)();
    // startNgrok(); // Khởi động ngrok khi server chạy
});
//# sourceMappingURL=index.js.map