"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controllers_js_1 = require("../controllers/product.controllers.js");
const protectRoute_js_1 = require("../middlewares/protectRoute.js");
const verifyToken_js_1 = require("../middlewares/verifyToken.js");
const cloudinary_config_js_1 = __importDefault(require("../config/cloudinary.config.js"));
const productRouter = (0, express_1.Router)();
// http://localhost:5000/api/products
productRouter.get('/products', product_controllers_js_1.getAllProduct);
productRouter.get('/products/:id', product_controllers_js_1.getProductById);
productRouter.get('/newproducts', product_controllers_js_1.getNewProduct);
productRouter.get('/saleproducts', product_controllers_js_1.getSaleProduct);
productRouter.get('/hotproducts', product_controllers_js_1.getHotProduct);
productRouter.get('/outproducts', product_controllers_js_1.getProductOutStock);
productRouter.post('/products', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, cloudinary_config_js_1.default.array('images_url', 12), product_controllers_js_1.insertProduct);
productRouter.patch('/products/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, cloudinary_config_js_1.default.array('images_url', 12), product_controllers_js_1.updateProduct);
productRouter.patch('/products/status/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, product_controllers_js_1.toggleProduct);
productRouter.patch('/products/toggle-status/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, product_controllers_js_1.toggleProductStatus); // Thêm route mới
productRouter.patch('/products/uploadimage/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, cloudinary_config_js_1.default.array('images_url', 12), product_controllers_js_1.uploadProductImage);
productRouter.get('/products/cate/:id', product_controllers_js_1.getProductByCategoryID);
productRouter.get('/products/status/active', product_controllers_js_1.getProductActive);
productRouter.get('/products/tags/:id', product_controllers_js_1.getProductByTagId);
productRouter.get('/products/:id/related', product_controllers_js_1.getProductRelated);
productRouter.delete('/products/:id', verifyToken_js_1.verifyToken, protectRoute_js_1.requireAdmin, product_controllers_js_1.deleteProduct);
// productRouter.patch("/products/:id/toggle-status", toggleProductStatus);
exports.default = productRouter;
//# sourceMappingURL=product.routes.js.map