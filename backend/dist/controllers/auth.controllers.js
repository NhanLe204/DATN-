"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminRole = exports.checkRoleStatus = exports.googleLogin = exports.refreshTokenController = exports.resetPasswordController = exports.forgotPasswordController = exports.authCheckController = exports.logoutController = exports.loginController = exports.verifyOTPController = exports.signupController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_js_1 = __importDefault(require("../utils/sendEmail.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js")); // Adjust the path according to your project structure
const jwt_js_1 = require("../utils/jwt.js"); // Adjust the path according to your project structure
const config_js_1 = __importDefault(require("../config/config.js"));
const google_auth_library_1 = require("google-auth-library");
const user_enum_js_1 = require("../enums/user.enum.js");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Hàm tạo mã màu hex ngẫu nhiên
const getRandomHexColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const signupController = async (req, res) => {
    try {
        const { email, password, fullname } = req.body;
        // Kiểm tra đầu vào
        if (!email || !password || !fullname) {
            res.status(400).json({
                success: false,
                message: 'Please provide an email, password and fullname'
            });
            return;
        }
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            res.status(400).json({ success: false, message: 'Please provide a valid email' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
            return;
        }
        if (fullname.length < 3) {
            res.status(400).json({
                success: false,
                message: 'Họ và tên phải có ít nhất 3 ký tự'
            });
            return;
        }
        // Kiểm tra email đã tồn tại
        const existingUserByEmail = await user_model_js_1.default.findOne({ email });
        if (existingUserByEmail) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        // Mã hóa mật khẩu
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Tạo URL avatar từ ui-avatars với màu nền ngẫu nhiên
        const randomBackgroundColor = getRandomHexColor(); // Sinh màu ngẫu nhiên
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=${randomBackgroundColor}&color=fff&size=256`;
        // Tạo OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5phút
        // Tạo user mới
        const newUser = new user_model_js_1.default({
            email,
            password: hashedPassword,
            fullname,
            avatar: avatarUrl, // Lưu URL avatar
            otp,
            otpExpiry,
            isVerified: false
        });
        await newUser.save();
        // Gửi mail otp
        const message = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn trong ${otpExpiry}`;
        await (0, sendEmail_js_1.default)(email, 'Xác thực email của bạn', message, '');
        res.status(201).json({
            success: true,
            user: { ...newUser._doc, password: '' }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error signing up: ${error.message}`);
        }
        else {
            console.error('Error signing up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.signupController = signupController;
// Xác thực OTP
const verifyOTPController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ success: false, message: 'Email và OTP là bắt buộc' });
            return;
        }
        const user = await user_model_js_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: 'Email không tồn tại' });
            return;
        }
        if (user.otp !== otp || new Date() > user.otpExpiry) {
            res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn' });
            return;
        }
        // xác thực thành công
        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        user.status = user_enum_js_1.UserStatus.ACTIVE;
        await user.save();
        (0, jwt_js_1.generateAccessToken)(user._id, res);
        res.status(200).json({
            success: true,
            message: 'Xác thực OTP thành công, mời bạn đăng nhập',
            user: { ...user._doc, password: '' }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error verifying OTP: ${error.message}`);
        }
        else {
            console.error('Error verifying OTP:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.verifyOTPController = verifyOTPController;
// Login
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Email', email);
        console.log('Password', password);
        const user = await user_model_js_1.default
            .findOne({ email })
            .select('-reset_password_token -reset_password_expires -refreshToken');
        if (!user) {
            res.status(404).json({ success: false, message: 'Email này chưa được đăng ký!' });
            return;
        }
        if (user.status === 'inactive') {
            res.status(401).json({ success: false, message: 'Tài khoản của bạn đã bị khóa!' });
            return;
        }
        if (user.status === user_enum_js_1.UserStatus.INACTIVE) {
            res.status(401).json({ success: false, message: 'Tài khoản của bạn đã bị khóa!' });
            return;
        }
        if (user.status === user_enum_js_1.UserStatus.PENDING) {
            res.status(403).json({ success: false, message: 'Vui lòng xác thực email bằng OTP trước khi đăng nhập!' });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'Mật khẩu không đúng!' });
            return;
        }
        const { password: pass, ...userData } = user.toObject();
        userData.role = user.role || 'user';
        userData.status = user.status || 'active';
        const accessToken = await (0, jwt_js_1.generateAccessToken)(user._id, res);
        const refreshToken = await (0, jwt_js_1.generateRefreshToken)(user._id, res);
        await user_model_js_1.default.findByIdAndUpdate(user._id, { refreshToken }, { new: true });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config_js_1.default.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ success: true, userData: userData, accessToken });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.loginController = loginController;
const logoutController = async (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(`Error logging out: ${error.message}`);
        }
        else {
            console.log('Error logging out:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.logoutController = logoutController;
const authCheckController = async (req, res) => {
    try {
        console.log('req.user', req.user);
        res.status(200).json({ success: true, user: req.user, token: req.token });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('Error in authCheck controller', error.message);
        }
        else {
            console.log('Error in authCheck controller', error);
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.authCheckController = authCheckController;
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('email', email);
        if (!email) {
            res.status(400).json({ success: false, message: 'Please provide an email' });
            return;
        }
        const user = await user_model_js_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: 'User with this email does not exist' });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(6).toString('hex');
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 3 * 60 * 1000; // **3 phút**
        user.reset_password_token = resetPasswordToken;
        user.reset_password_expires = resetPasswordExpire;
        await user.save();
        const resetUrl = `${req.protocol}://${req.get('host')}/passwordreset/${resetToken}`;
        const message = `
			Mã xác nhận của bạn là: ${resetToken}
    `;
        try {
            await (0, sendEmail_js_1.default)(user.email, 'Reset Your PetShop Password', message, '');
            res.status(200).json({ success: true, message: 'Email sent' });
        }
        catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    }
    catch (error) {
        console.error(`Error in forgotPasswordController: ${error}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            res.status(400).json({ success: false, message: 'Mã xác nhận và mật khẩu mới là bắt buộc' });
            return;
        }
        // Hash resetToken để so sánh với token đã lưu trong DB
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        console.log(hashedToken, 'hashedToken');
        // Tìm user có token hợp lệ và chưa hết hạn
        const user = await user_model_js_1.default.findOne({
            reset_password_token: hashedToken,
            reset_password_expires: { $gt: Date.now() } // Kiểm tra xem token còn hạn không
        });
        if (!user) {
            res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Cập nhật mật khẩu mới
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Mật khẩu đã được cập nhật thành công' });
    }
    catch (error) {
        console.error('Error in resetPasswordController:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.resetPasswordController = resetPasswordController;
const refreshTokenController = async (req, res) => {
    try {
        const cookie = req.cookies;
        if (!cookie.refreshToken) {
            res.status(401).json({ success: false, message: 'No refresh token in cookies' });
            return;
        }
        if (!config_js_1.default.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        console.log('Received refresh token:', cookie.refreshToken);
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(cookie.refreshToken, config_js_1.default.JWT_SECRET);
            console.log('Decoded token payload:', decoded);
        }
        catch (error) {
            console.error('JWT Verification Error:', error);
            res.status(401).json({ success: false, message: 'Invalid refresh token' });
            return;
        }
        if (!decoded) {
            res.status(401).json({ success: false, message: 'Invalid token payload' });
            return;
        }
        const user = await user_model_js_1.default.findOne({
            _id: decoded.userId,
            refreshToken: cookie.refreshToken
        });
        if (!user) {
            res.status(403).json({ success: false, message: 'User not found or token mismatch' });
            return;
        }
        const accessToken = await (0, jwt_js_1.generateAccessToken)(user._id, res);
        res.status(200).json({ success: true, newAccessToken: accessToken });
    }
    catch (error) {
        console.error('Error in refreshTokenController:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.refreshTokenController = refreshTokenController;
// GOOGLE LOGIN
const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    try {
        console.log('Received idToken:', idToken);
        if (!idToken) {
            res.status(400).json({ success: false, message: 'No idToken provided' });
            return;
        }
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;
        let user = (await user_model_js_1.default.findOne({ googleId })) || (await user_model_js_1.default.findOne({ email }));
        if (user) {
            if (user.status === 'inactive') {
                res.status(401).json({ success: false, message: 'Tài khoản của bạn đã bị khóa!' });
                return;
            }
            if (user.status === 'pending') {
                res.status(403).json({ success: false, message: 'Vui lòng xác thực email bằng OTP trước khi đăng nhập!' });
                return;
            }
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }
        else {
            user = new user_model_js_1.default({
                googleId,
                email,
                fullname: name,
                avatar,
                role: 'user',
                status: 'active'
            });
            await user.save();
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const accessToken = await (0, jwt_js_1.generateAccessToken)(user._id, res);
        const refreshToken = await (0, jwt_js_1.generateRefreshToken)(user._id, res);
        const userData = {
            id: user._id.toString(),
            email: user.email,
            fullname: user.fullname,
            avatar: user.avatar,
            role: user.role || 'user',
            status: user.status || 'active'
        };
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config_js_1.default.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ success: true, accessToken, user: userData });
    }
    catch (error) {
        console.error('Google Sign-In error:', error);
        res.status(401).json({ success: false, message: 'Invalid Google token or server error' });
    }
};
exports.googleLogin = googleLogin;
// Check role and status
const checkRoleStatus = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ success: false, message: 'JWT_SECRET is not defined' });
            return;
        }
        // Xác thực JWT
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }
        // Tìm user trong database
        const user = await user_model_js_1.default.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Kiểm tra status
        if (user.status !== user_enum_js_1.UserStatus.ACTIVE) {
            res.status(403).json({ success: false, message: 'User is not active' });
            return;
        }
        // Gắn user vào req
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkRoleStatus = checkRoleStatus;
// kiểm tra role ADMIN
const checkAdminRole = (req, res, next) => {
    if (!req.user || req.user.role !== user_enum_js_1.UserRoles.ADMIN) {
        res.status(403).json({ success: false, message: 'Access denied. Admin role required' });
        return;
    }
    next();
};
exports.checkAdminRole = checkAdminRole;
//# sourceMappingURL=auth.controllers.js.map