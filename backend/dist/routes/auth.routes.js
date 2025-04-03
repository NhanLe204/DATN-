"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_js_1 = require("../controllers/auth.controllers.js");
const authRouter = (0, express_1.Router)();
// http://localhost:5000/api/v1/auth
authRouter.post('/signup', auth_controllers_js_1.signupController);
authRouter.post('/login', auth_controllers_js_1.loginController);
authRouter.post('/logout', auth_controllers_js_1.logoutController);
authRouter.get('/authCheck', auth_controllers_js_1.checkRoleStatus, auth_controllers_js_1.authCheckController);
authRouter.post('/forgotPassword', auth_controllers_js_1.forgotPasswordController);
authRouter.post('/resetPassword', auth_controllers_js_1.resetPasswordController);
authRouter.post('/refreshtoken', auth_controllers_js_1.refreshTokenController);
authRouter.post('/google', auth_controllers_js_1.googleLogin);
authRouter.post('/verify-otp', auth_controllers_js_1.verifyOTPController);
// bảo vệ route admin
authRouter.get('/admin', auth_controllers_js_1.checkRoleStatus, auth_controllers_js_1.checkAdminRole, (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome Admin' });
});
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map