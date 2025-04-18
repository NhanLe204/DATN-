"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
// Cấu hình Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
// Hàm lấy tên thư mục từ route
const getFolderFromRoute = (req) => {
    const folderActive = ['products', 'categories', 'users', 'orders', 'reviews', 'blogs'];
    // Lấy route và làm sạch nó
    const route = req.originalUrl
        .replace('/api/v1/', '') // Loại bỏ phần /api/v1/
        .split('/')[0] // Chỉ lấy phần đầu tiên của route (ví dụ: products từ products/123)
        .split('?')[0]; // Loại bỏ query params nếu có (ví dụ: products?key=value)
    // Kiểm tra xem route có nằm trong danh sách folderActive không
    if (!folderActive.includes(route)) {
        throw new Error(`Route ${route} is not supported for file upload`);
    }
    return `uploads/${route}`;
};
// Hàm tạo public_id sạch, không chứa ký tự gây tạo thư mục con
const generatePublicId = (originalName) => {
    // Lấy tên file gốc, loại bỏ phần mở rộng
    const nameWithoutExtension = originalName.split('.')[0];
    // Thay thế các ký tự không mong muốn (như /) để tránh tạo thư mục con
    const cleanName = nameWithoutExtension.replace(/[^a-zA-Z0-9-_]/g, '_');
    // Thêm timestamp để tránh trùng lặp
    return `${cleanName}_${Date.now()}`;
};
// Cấu hình CloudinaryStorage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        const folder = getFolderFromRoute(req);
        const publicId = generatePublicId(file.originalname);
        return {
            folder: folder, // Thư mục chính (ví dụ: uploads/products)
            public_id: publicId, // Tên file sạch, không gây tạo thư mục con
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            // Tùy chọn: thêm transformation nếu cần
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
        };
    }
});
// Khởi tạo multer với storage
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn file size: 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only images (jpg, png, webp) are allowed'));
        }
        cb(null, true);
    }
});
exports.default = upload;
//# sourceMappingURL=cloudinary.config.js.map