import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import dotenv from 'dotenv';
import ENV_VARS from './config/config.js';
import { connectDB } from './database/db.js';
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import brandRouter from './routes/brand.routes.js';
import rateRouter from './routes/rating.routes.js';
import couponRouter from './routes/coupon.routes.js';
import orderRouter from './routes/order.routes.js';
import tagRouter from './routes/tag.routes.js';
import serviceRouter from './routes/service.routes.js';
import paymentRouter from './routes/payment.routes.js';
import paymentTypeRouter from './routes/paymentType.routes.js';
import deliveryRouter from './routes/delivery.routes.js';
import orderDetailRouter from './routes/orderDetail.routes.js';
import contactRouter from './routes/contact.routes.js'; // Import contact router
import ngrok from '@ngrok/ngrok'; // Thêm ngrok SDK
import blogRouter from './routes/blog.routes.js';
import blogCategoryRouter from './routes/blogCategory.routes.js';

dotenv.config(); // Đọc file .env
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const PORT = ENV_VARS.PORT;

const corsOptions = {
  origin: `${ENV_VARS.FE_URL}`,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // will allow us to parse req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));

app.get('/', (req, res) => {
  res.send('Hello World1');
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', categoryRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', brandRouter);
app.use('/api/v1', rateRouter);
app.use('/api/v1', couponRouter);
app.use('/api/v1', orderRouter);
app.use('/api/v1', tagRouter);
app.use('/api/v1', serviceRouter);
app.use('/api/v1', paymentTypeRouter);
app.use('/api/v1', deliveryRouter);
app.use('/api/v1', paymentRouter);
app.use('/api/v1', orderDetailRouter);
app.use('/api/v1', blogRouter);
app.use('/api/v1', blogCategoryRouter);

app.use('/api/v1', contactRouter); // Thêm router contact vào đây

app.use(errorHandler);

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
  connectDB();
  // startNgrok(); // Khởi động ngrok khi server chạy
});
