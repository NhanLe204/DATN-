import { getAllServices, createService, getServiceActive, getServiceById, updateService, deleteService } from '../controllers/service.controllers.js';
import { requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { Router } from 'express';
const serviceRouter = Router();
// Định nghĩa các route cho Service
serviceRouter.get('/services', verifyToken, requireAdmin, getAllServices); // Lấy tất cả dịch vụ
serviceRouter.post('/services', createService); // Tạo mới một dịch vụ
serviceRouter.get('/services/status/active', getServiceActive);
serviceRouter.get('/services/:id', getServiceById);
serviceRouter.patch('/services/:id', verifyToken, requireAdmin, updateService); // Cập nhật dịch vụ theo serviceID
serviceRouter.delete('/services/:id', verifyToken, requireAdmin, deleteService);
// serviceRouter.get('/services/:id', getServiceById); // Lấy dịch vụ theo serviceID
// serviceRouter.delete('/services/:id', deleteService); // Xóa dịch vụ theo serviceID
export default serviceRouter;
//# sourceMappingURL=service.routes.js.map