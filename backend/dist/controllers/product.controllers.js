"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProductOutStock = exports.toggleProductStatus = exports.toggleProduct = exports.getProductRelated = exports.getProductByTagId = exports.getProductActive = exports.uploadProductImage = exports.getProductByCategoryID = exports.getHotProduct = exports.getSaleProduct = exports.getNewProduct = exports.updateProduct = exports.insertProduct = exports.getProductById = exports.getAllProduct = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const product_model_js_1 = __importDefault(require("../models/product.model.js"));
const product_enum_js_1 = require("../enums/product.enum.js");
const category_model_js_1 = __importDefault(require("../models/category.model.js"));
const tag_model_js_1 = __importDefault(require("../models/tag.model.js"));
const brand_model_js_1 = __importDefault(require("../models/brand.model.js"));
const removeVietnameseTones = (str) => {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, (match) => (match === 'đ' ? 'd' : 'D'));
    return str.toLowerCase();
};
const getAllProduct = async (req, res) => {
    try {
        const { search, tag, status, brand, category, priceMin, priceMax, page = '1', limit = '10' } = req.query;
        const query = {};
        // 1. Lọc theo trạng thái (status)
        if (status && typeof status === 'string') {
            if (!Object.values(product_enum_js_1.ProductStatus).includes(status)) {
                res.status(400).json({
                    success: false,
                    message: `Trạng thái không hợp lệ. Chỉ chấp nhận ${Object.values(product_enum_js_1.ProductStatus).join(', ')}`
                });
                return;
            }
            query.status = status;
        }
        // 2. Lọc theo tag (tag_id)
        if (tag && typeof tag === 'string') {
            if (!ObjectId.isValid(tag)) {
                res.status(400).json({ success: false, message: 'Tag ID không hợp lệ' });
                return;
            }
            const tagExists = await tag_model_js_1.default.findById(tag);
            if (!tagExists) {
                res.status(404).json({ success: false, message: `Tag với ID ${tag} không tồn tại` });
                return;
            }
            query.tag_id = new ObjectId(tag);
        }
        // 3. Tìm kiếm theo tên sản phẩm (search) với hỗ trợ không dấu
        if (search && typeof search === 'string') {
            const searchNoTones = removeVietnameseTones(search);
            query.name = { $regex: searchNoTones, $options: 'i' }; // Tìm kiếm không phân biệt hoa/thường và không dấu
        }
        // 4. Lọc theo thương hiệu (brand_id)
        if (brand && typeof brand === 'string') {
            if (!ObjectId.isValid(brand)) {
                res.status(400).json({ success: false, message: 'Brand ID không hợp lệ' });
                return;
            }
            const brandExists = await brand_model_js_1.default.findById(brand);
            if (!brandExists) {
                res.status(404).json({ success: false, message: `Brand với ID ${brand} không tồn tại` });
                return;
            }
            query.brand_id = new ObjectId(brand);
        }
        // 5. Lọc theo danh mục (category_id)
        if (category && typeof category === 'string') {
            if (!ObjectId.isValid(category)) {
                res.status(400).json({ success: false, message: 'Category ID không hợp lệ' });
                return;
            }
            const categoryExists = await category_model_js_1.default.findById(category);
            if (!categoryExists) {
                res.status(404).json({ success: false, message: `Category với ID ${category} không tồn tại` });
                return;
            }
            query.category_id = new ObjectId(category);
        }
        // 6. Lọc theo khoảng giá (priceMin và priceMax)
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin && typeof priceMin === 'string') {
                const min = parseFloat(priceMin);
                if (isNaN(min) || min < 0) {
                    res.status(400).json({ success: false, message: 'Giá tối thiểu không hợp lệ' });
                    return;
                }
                query.price.$gte = min;
            }
            if (priceMax && typeof priceMax === 'string') {
                const max = parseFloat(priceMax);
                if (isNaN(max) || max < 0) {
                    res.status(400).json({ success: false, message: 'Giá tối đa không hợp lệ' });
                    return;
                }
                query.price.$lte = max;
            }
            if (query.price.$gte !== undefined && query.price.$lte !== undefined && query.price.$gte > query.price.$lte) {
                res.status(400).json({ success: false, message: 'Giá tối thiểu không được lớn hơn giá tối đa' });
                return;
            }
        }
        // Phân trang
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        if (pageNum < 1 || limitNum < 1) {
            res.status(400).json({ success: false, message: 'Page và limit phải là số dương' });
            return;
        }
        const skip = (pageNum - 1) * limitNum;
        // Đếm tổng số sản phẩm phù hợp với điều kiện lọc
        const total = await product_model_js_1.default.countDocuments(query);
        // Thực hiện truy vấn với các điều kiện lọc và phân trang
        const result = await product_model_js_1.default
            .find(query)
            .populate('category_id', 'name')
            .populate('brand_id', 'brand_name')
            .populate('tag_id', 'tag_name')
            .skip(skip)
            .limit(limitNum);
        // Trả về kết quả
        res.status(200).json({
            success: true,
            message: result.length > 0 ? 'Lấy danh sách sản phẩm thành công' : 'Không tìm thấy sản phẩm phù hợp',
            result,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error.message || error);
        res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
};
exports.getAllProduct = getAllProduct;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await product_model_js_1.default.findById(id).populate('category_id').populate('brand_id').populate('tag_id');
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.status(200).json({ message: 'Lấy sản phẩm thành công', product });
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting product', error });
    }
};
exports.getProductById = getProductById;
const insertProduct = async (req, res) => {
    try {
        if (!req.files) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const images = [];
        const fileData = req.files;
        if (Array.isArray(fileData) && fileData.length > 0) {
            fileData.map((file) => {
                images.push(file?.path);
            });
        }
        console.log(fileData);
        const { name, description, price, category_id, tag_id, brand_id, status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(category_id)) {
            res.status(400).json({ message: 'Required field' });
            return;
        }
        const newProduct = new product_model_js_1.default({
            name,
            description,
            price,
            category_id,
            image_url: images,
            tag_id,
            brand_id,
            status
        });
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};
exports.insertProduct = insertProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, 'ID');
        const { name, description, price, category_id, status, quantity, discount, brand_id, tag_id, existing_images, new_images } = req.body;
        if (!name || !price || !category_id || !status) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc: name, price, category_id, status'
            });
            return;
        }
        const currentProduct = await product_model_js_1.default.findById(id);
        if (!currentProduct) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        // Khởi tạo danh sách ảnh từ dữ liệu hiện tại
        let images_url = [...(currentProduct.image_url || [])];
        // Xử lý ảnh cũ còn lại từ existing_images
        let keptImages = [];
        if (existing_images) {
            keptImages = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
            if (!Array.isArray(keptImages))
                keptImages = [];
        }
        // Xử lý ảnh mới từ req.files và new_images
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newImagesPaths = req.files.map((file) => file.path);
            let newImagesIndices = [];
            if (new_images) {
                newImagesIndices = typeof new_images === 'string' ? JSON.parse(new_images) : new_images;
            }
            // Tạo danh sách ảnh cuối cùng
            const finalImages = [];
            const maxIndex = Math.max(images_url.length, ...newImagesIndices.map((ni) => ni.index));
            // Điền ảnh cũ và ảnh mới vào vị trí tương ứng
            for (let i = 0; i <= maxIndex; i++) {
                const newImageIndex = newImagesIndices.findIndex((ni) => ni.index === i);
                if (newImageIndex !== -1) {
                    // Thay thế hoặc thêm ảnh mới tại vị trí chỉ định
                    finalImages[i] = newImagesPaths[newImageIndex];
                }
                else if (i < images_url.length && keptImages.includes(images_url[i])) {
                    // Giữ lại ảnh cũ nếu có trong keptImages
                    finalImages[i] = images_url[i];
                }
            }
            // Cập nhật images_url
            images_url = finalImages.filter((img) => img !== undefined);
        }
        else {
            // Nếu không có ảnh mới, chỉ giữ lại ảnh trong existing_images
            images_url = keptImages;
        }
        console.log('Final images_url:', images_url);
        if (!Object.values(product_enum_js_1.ProductStatus).includes(status)) {
            res.status(400).json({ success: false, message: 'Trạng thái sản phẩm không hợp lệ' });
            return;
        }
        const updatedProduct = await product_model_js_1.default.findByIdAndUpdate(id, {
            name,
            description,
            price,
            category_id,
            image_url: images_url,
            brand_id,
            status,
            tag_id,
            quantity,
            discount
        }, { new: true, runValidators: true });
        if (!updatedProduct) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error product up: ${error.message}`);
        }
        else {
            console.error('Error product up:', error);
        }
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật sản phẩm' });
    }
};
exports.updateProduct = updateProduct;
const getNewProduct = async (req, res) => {
    try {
        const result = await product_model_js_1.default
            .find({ status: product_enum_js_1.ProductStatus.AVAILABLE })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('category_id')
            .populate('brand_id');
        if (!result || result.length === 0) {
            res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm mới' });
            return;
        }
        res.status(200).json({ success: true, message: 'Lấy sản phẩm mới thành công', result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm mới', error });
    }
};
exports.getNewProduct = getNewProduct;
const getSaleProduct = async (req, res) => {
    try {
        const result = await product_model_js_1.default
            .find({ discount: { $gt: 0 }, status: product_enum_js_1.ProductStatus.AVAILABLE })
            .populate('category_id')
            .populate('brand_id')
            .limit(10);
        if (!result || result.length === 0) {
            res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm giảm giá' });
            return;
        }
        res.status(200).json({ success: true, message: 'Lấy sản phẩm giảm giá thành công', result: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm giảm giá', error });
    }
};
exports.getSaleProduct = getSaleProduct;
const getHotProduct = async (req, res) => {
    try {
        const result = await product_model_js_1.default
            .find({ status: product_enum_js_1.ProductStatus.AVAILABLE })
            .sort({ quantity_sold: -1 })
            .limit(10)
            .populate('category_id')
            .populate('brand_id')
            .populate('tag_id');
        if (!result || result.length === 0) {
            res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm bán chạy' });
            return;
        }
        res.status(200).json({ success: true, message: 'Lấy sản phẩm bán chạy thành công', result: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm bán chạy', error });
    }
};
exports.getHotProduct = getHotProduct;
const getProductByCategoryID = async (req, res) => {
    let categoryName = 'category'; // Giá trị mặc định nếu không lấy được name
    try {
        const { id } = req.params;
        console.log('Received category ID:', id); // Log để kiểm tra
        // Kiểm tra id có tồn tại không
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
            return;
        }
        // Kiểm tra tính hợp lệ của id
        if (!ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid category ID format'
            });
            return;
        }
        // Parse id thành ObjectId
        const categoryId = new ObjectId(id);
        console.log('Parsed ObjectId:', categoryId); // Log để kiểm tra
        // Lấy thông tin category để lấy name
        const category = await category_model_js_1.default.findById(categoryId);
        if (!category) {
            res.status(404).json({
                success: false,
                message: `Category with ID ${id} not found`
            });
            return;
        }
        categoryName = category.name || 'category'; // Lấy name của category, mặc định là 'category' nếu không có
        console.log('Category name:', categoryName); // Log để kiểm tra
        // Query sản phẩm
        const result = await product_model_js_1.default.find({ category_id: categoryId });
        console.log('Query result:', result); // Log để kiểm tra
        // Kiểm tra kết quả
        if (!result || result.length === 0) {
            res.status(404).json({
                success: false,
                message: `No products found for category "${categoryName}" (ID: ${id})`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Lấy sản phẩm dành cho ${categoryName} thành công`,
            result
        });
    }
    catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: `Lỗi khi lấy sản phẩm dành cho ${categoryName}`
        });
    }
};
exports.getProductByCategoryID = getProductByCategoryID;
const uploadProductImage = async (req, res) => {
    console.log('Received files:', req.files); // Debug
    if (!req.files) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    res.status(200).json({ message: 'Upload images successfully', files: req.files });
};
exports.uploadProductImage = uploadProductImage;
const getProductActive = async (req, res) => {
    try {
        const result = await product_model_js_1.default.find({ status: product_enum_js_1.ProductStatus.AVAILABLE });
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
};
exports.getProductActive = getProductActive;
const getProductByTagId = async (req, res) => {
    let tagName = 'tag';
    try {
        const { id } = req.params;
        console.log('Received tag_id ID:', id);
        // Kiểm tra id có tồn tại không
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Tag ID is required'
            });
            return;
        }
        // Kiểm tra tính hợp lệ của id
        if (!ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid Tag ID format'
            });
            return;
        }
        // Parse id thành ObjectId
        const tagId = new ObjectId(id);
        console.log('Parsed ObjectId:', tagId); // Log để kiểm tra
        // Lấy thông tin category để lấy name
        const tag = await tag_model_js_1.default.findById(tagId);
        if (!tag) {
            res.status(404).json({
                success: false,
                message: `Tag with ID ${id} not found`
            });
            return;
        }
        tagName = tag.tag_name || 'TAG';
        console.log('Category name:', tagName); // Log để kiểm tra
        // Query sản phẩm
        const result = await product_model_js_1.default.find({ tag_id: tagId });
        console.log('Query result:', result); // Log để kiểm tra
        // Kiểm tra kết quả
        if (!result || result.length === 0) {
            res.status(404).json({
                success: false,
                message: `No products found for tag "${tagName}" (ID: ${id})`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Lấy sản phẩm dành cho "${tagName}" thành công`,
            products: result
        });
    }
    catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: `Lỗi khi lấy sản phẩm dành cho ${tagName}`
        });
    }
};
exports.getProductByTagId = getProductByTagId;
const getProductRelated = async (req, res) => {
    try {
        const productId = req.params.id;
        // Tìm sản phẩm theo ID
        const product = await product_model_js_1.default.findById(productId).lean();
        if (!product) {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            return;
        }
        // Kiểm tra các trường cần thiết
        const { category_id, tag_id } = product;
        console.log(category_id, 'category_id');
        console.log(tag_id, 'tag_id');
        // Nếu không có tiêu chí nào để tìm sản phẩm liên quan
        if (!category_id && !tag_id) {
            res.status(200).json([]); // Trả về mảng rỗng
            return;
        }
        // Tạo điều kiện query cho sản phẩm liên quan
        const queryConditions = [];
        if (category_id)
            queryConditions.push({ category_id: new mongoose_1.Types.ObjectId(category_id) });
        if (tag_id)
            queryConditions.push({ tag_id: new mongoose_1.Types.ObjectId(tag_id) });
        console.log(queryConditions, 'SSS1111111111111');
        // Tìm sản phẩm liên quan
        const relatedProducts = await product_model_js_1.default
            .find({
            _id: { $ne: new mongoose_1.Types.ObjectId(productId) }, // Loại bỏ chính sản phẩm hiện tại
            $and: queryConditions // Tìm sản phẩm có ít nhất một trường khớp
        })
            .find({ status: product_enum_js_1.ProductStatus.AVAILABLE })
            .limit(10) // Giới hạn số lượng sản phẩm trả về
            .lean();
        res.status(200).json(relatedProducts);
    }
    catch (error) {
        console.error('Lỗi khi lấy sản phẩm liên quan:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm liên quan' });
    }
};
exports.getProductRelated = getProductRelated;
const toggleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        console.log('ID Product:', id);
        console.log('Status Product:', status);
        if (!id) {
            res.status(400).json({ message: 'Vui lòng cung cấp ID sản phẩm' });
            return;
        }
        // Kiểm tra status có hợp lệ không
        const statusString = String(status).toLowerCase();
        if (!Object.values(product_enum_js_1.ProductStatus).includes(statusString)) {
            res.status(400).json({
                message: `Trạng thái không hợp lệ. Chỉ chấp nhận ${product_enum_js_1.ProductStatus.AVAILABLE}, ${product_enum_js_1.ProductStatus.DISCONTINUED}, ${product_enum_js_1.ProductStatus.OUT_OF_STOCK}  `
            });
            return;
        }
        // Tìm sản phẩm theo ID
        const product = await product_model_js_1.default.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            return;
        }
        product.status = statusString;
        await product.save();
        res.status(200).json({
            message: `Sản phẩm đã được chuyển trạng thái ${statusString} thành công`,
            product
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm', error });
        return;
    }
};
exports.toggleProduct = toggleProduct;
const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log('ID Product:', id);
        console.log('New Status:', status);
        if (!id) {
            res.status(400).json({ message: 'Vui lòng cung cấp ID sản phẩm' });
            return;
        }
        if (!Object.values(product_enum_js_1.ProductStatus).includes(status)) {
            res.status(400).json({
                message: `Trạng thái không hợp lệ. Chỉ chấp nhận ${Object.values(product_enum_js_1.ProductStatus).join(', ')}`
            });
            return;
        }
        const product = await product_model_js_1.default.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            return;
        }
        product.status = status;
        await product.save();
        res.status(200).json({
            message: `Trạng thái sản phẩm đã được cập nhật thành ${status} thành công`,
            product
        });
    }
    catch (error) {
        console.error('Error toggling product status:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm', error });
    }
};
exports.toggleProductStatus = toggleProductStatus;
const getProductOutStock = async (req, res) => {
    try {
        const result = await product_model_js_1.default
            .find({ status: product_enum_js_1.ProductStatus.OUT_OF_STOCK })
            .populate('category_id')
            .populate('brand_id')
            .populate('tag_id');
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        res.status(500).json({ success: false, error });
    }
};
exports.getProductOutStock = getProductOutStock;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await product_model_js_1.default.findById(id).populate('category_id').populate('brand_id').populate('tag_id');
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        await product_model_js_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: 'Xóa sản phẩm thành công', product });
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting product', error });
    }
};
exports.deleteProduct = deleteProduct;
// quản lí số lượng sản phẩm
//# sourceMappingURL=product.controllers.js.map