import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
import { Request } from 'express';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const getFolderFromRoute = (req: Request) => {
  // Lấy từ đường dẫn route, ví dụ: /api/v1/products -> products
  const route = req.originalUrl.replace('/api/v1/', ''); // Loại bỏ phần /api/v1/
  console.log(route, 'Route');
  return `uploads/${route}`;
};
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: getFolderFromRoute(req),
      public_id: file.originalname.split('.')[0],
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    };
  }
});

const upload = multer({ storage });

export default upload;
