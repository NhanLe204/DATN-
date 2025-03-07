import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: 'uploads/avatar', // Lưu vào thư mục 'products' trên Cloudinary
            public_id: file.originalname.split('.')[0], // Đặt tên file theo tên gốc (không có đuôi mở rộng)
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        };
    }
});
const upload = multer({ storage });
export default upload;
//# sourceMappingURL=cloudinary.config.js.map