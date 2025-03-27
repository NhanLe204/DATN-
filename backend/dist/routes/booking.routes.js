import { Router } from 'express';
import { createBookingSpa } from '@/controllers/booking.controllers.js';
const bookingRouter = Router();
// http://localhost:3000/api/v1/booking/booking-spa
bookingRouter.get('/booking-spa', createBookingSpa);
// bookingRouter.get('/brands/:id', getBrandById);
// bookingRouter.post('/brands', verifyToken, requireAdmin, insertBrand);
// bookingRouter.patch('/brands/:id', verifyToken, requireAdmin, updateBrand);
// bookingRouter.delete('/brands/:id', verifyToken, requireAdmin, deleteBrand);
export default bookingRouter;
//# sourceMappingURL=booking.routes.js.map