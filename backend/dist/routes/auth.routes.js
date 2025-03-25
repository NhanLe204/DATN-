import { Router } from 'express';
import { signupController, loginController, logoutController, authCheckController, forgotPasswordController, resetPasswordController, refreshTokenController, googleLogin, checkAdminRole, checkRoleStatus, verifyOTPController } from '../controllers/auth.controllers.js';
const authRouter = Router();
authRouter.post('/signup', signupController);
authRouter.post('/login', loginController);
authRouter.post('/logout', logoutController);
authRouter.get('/authCheck', checkRoleStatus, authCheckController);
authRouter.post('/forgotPassword', forgotPasswordController);
authRouter.post('/resetPassword', resetPasswordController);
authRouter.post('/refreshtoken', refreshTokenController);
authRouter.post('/google', googleLogin);
authRouter.post('/verify-otp', verifyOTPController);
// bảo vệ route admin
authRouter.get('/admin', checkRoleStatus, checkAdminRole, (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome Admin' });
});
export default authRouter;
//# sourceMappingURL=auth.routes.js.map