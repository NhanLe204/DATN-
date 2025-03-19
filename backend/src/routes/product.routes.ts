import { Router } from 'express';
import {
  getAllProduct,
  getNewProduct,
  getProductById,
  insertProduct,
  toggleProduct,
  updateProduct,
  getSaleProduct,
  getHotProduct,
  uploadProductImage,
  getProductByCategoryID,
  getProductActive,
  getProductByTagId,
  hideProduct
} from '../controllers/product.controllers.js';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { get } from 'http';
import { verifyToken } from '../middlewares/verifyToken.js';
import uploader from '../config/cloudinary.config.js';
const productRouter = Router();
productRouter.get('/products', getAllProduct);
productRouter.get('/products/:id', getProductById);
productRouter.get('/newproducts', getNewProduct);
productRouter.get('/saleproducts', getSaleProduct);
productRouter.get('/hotproducts', getHotProduct);
productRouter.post('/products', verifyToken, requireAdmin, insertProduct);
productRouter.patch('/products/:id', verifyToken, requireAdmin, updateProduct);
productRouter.patch('/products/hide/:id', verifyToken, requireAdmin, hideProduct);
productRouter.patch(
  '/products/uploadimage/:id',
  verifyToken,
  requireAdmin,
  uploader.array('images_url', 12),
  uploadProductImage
);
productRouter.get('/products/cate/:id', getProductByCategoryID);
productRouter.get('/products/status/active', getProductActive);
productRouter.get('/products/tags/:id', getProductByTagId);
// productRouter.delete('/products/:id', protectRoute, requireAdmin, toggleProduct);

export default productRouter;
