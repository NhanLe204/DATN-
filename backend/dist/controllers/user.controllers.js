"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoyalUsers = exports.setDefaultAddress = exports.getNewUsers = exports.changePassword = exports.deleteUserAddress = exports.updateUserAddress = exports.addUserAddress = exports.updateCart = exports.updateUser = exports.getUserById = exports.getAllUser = void 0;
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const order_model_js_1 = __importDefault(require("@/models/order.model.js"));
// lấy hết nè má
const getAllUser = async (req, res) => {
    try {
        const result = await user_model_js_1.default.find().select('-password');
        res.status(200).json({ success: true, result });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error user up: ${error.message}`);
            return;
        }
        else {
            console.error('Error user up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getAllUser = getAllUser;
// Lấy user theo id nè má
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_model_js_1.default.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching user: ${error.message}`);
        }
        else {
            console.error('Error fetching user:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getUserById = getUserById;
// Cập nhật user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, 'ID');
        const { email, fullname, phone_number, address, role, avatar, status, dateOfBirth } = req.body;
        // Không bắt buộc tất cả trường, chỉ cần ít nhất một trường để cập nhật
        if (!email && !fullname && !phone_number && !address && !role && !avatar && !status && !dateOfBirth) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ít nhất một thông tin để cập nhật'
            });
            return;
        }
        const updateData = {};
        if (email)
            updateData.email = email;
        if (fullname)
            updateData.fullname = fullname;
        if (phone_number)
            updateData.phone_number = phone_number;
        if (address)
            updateData.address = address;
        if (role)
            updateData.role = role;
        if (status)
            updateData.status = status;
        if (dateOfBirth)
            updateData.dateOfBirth = dateOfBirth;
        if (req.file) {
            updateData.avatar = req.file.path; // URL của ảnh từ Cloudinary
        }
        const updatedUser = await user_model_js_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        res.status(200).json({
            message: 'Người dùng đã được cập nhật thành công',
            user: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error user up: ${error.message}`);
        }
        else {
            console.error('Error user up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.updateUser = updateUser;
const updateCart = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { _id } = req.user;
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            res.status(400).json({ message: 'Vui lòng cung cấp productId và quantity' });
            return;
        }
        const user = await user_model_js_1.default.findById(_id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        console.log(typeof productId, productId, 'productId từ req.body');
        console.log(user.cart, 'Giỏ hàng từ database');
        // Ép productId từ string sang ObjectId
        const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
        // So sánh bằng .equals() để tránh lỗi kiểu dữ liệu
        const alreadyProduct = user.cart.find((item) => item.product.equals(productObjectId));
        console.log(alreadyProduct, 'alreadyProduct');
        if (alreadyProduct) {
            console.log('Đã tìm thấy sản phẩm trong giỏ hàng, cập nhật số lượng');
            alreadyProduct.quantity += quantity;
            await user.save();
            res.status(200).json({ message: 'Cập nhật giỏ hàng thành công', user });
        }
        else {
            console.log('Sản phẩm chưa có trong giỏ hàng, thêm mới');
            const response = await user_model_js_1.default.findByIdAndUpdate(_id, { $push: { cart: { product: productObjectId, quantity } } }, { new: true });
            res.status(200).json({ message: 'Thêm sản phẩm vào giỏ hàng thành công', response });
        }
    }
    catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateCart = updateCart;
const addUserAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const newAddress = req.body;
        // Validate dữ liệu địa chỉ mới
        if (!newAddress || typeof newAddress !== 'object' || !newAddress.name || !newAddress.phone || !newAddress.address) {
            res.status(400).json({
                success: false,
                message: 'Dữ liệu địa chỉ không hợp lệ! Yêu cầu các trường name, phone, address.'
            });
            return;
        }
        // Tìm user và thêm địa chỉ mới vào mảng address
        const user = await user_model_js_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        user.address = user.address || [];
        user.address.push(newAddress);
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Thêm địa chỉ thành công',
            user: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error adding address: ${error.message}`);
            res.status(500).json({ success: false, message: `Lỗi server: ${error.message}` });
        }
        else {
            console.error('Error adding address:', error);
            res.status(500).json({ success: false, message: 'Lỗi server không xác định' });
        }
    }
};
exports.addUserAddress = addUserAddress;
const updateUserAddress = async (req, res) => {
    try {
        const { id, index } = req.params;
        const updatedAddress = req.body;
        // Validate dữ liệu địa chỉ
        if (!updatedAddress ||
            typeof updatedAddress !== 'object' ||
            !updatedAddress.name ||
            !updatedAddress.phone ||
            !updatedAddress.address) {
            res.status(400).json({
                success: false,
                message: 'Dữ liệu địa chỉ không hợp lệ! Yêu cầu các trường name, phone, address.'
            });
            return;
        }
        // Kiểm tra id hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ!'
            });
            return;
        }
        // Kiểm tra index hợp lệ
        const addressIndex = parseInt(index, 10);
        if (isNaN(addressIndex) || addressIndex < 0) {
            res.status(400).json({
                success: false,
                message: 'Index địa chỉ không hợp lệ!'
            });
            return;
        }
        // Tìm user
        const user = await user_model_js_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        // Kiểm tra index có nằm trong mảng address không
        if (!user.address || addressIndex >= user.address.length) {
            res.status(400).json({
                success: false,
                message: 'Địa chỉ không tồn tại!'
            });
            return;
        }
        // Cập nhật địa chỉ tại vị trí index
        user.address[addressIndex] = updatedAddress;
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Cập nhật địa chỉ thành công',
            user: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating address: ${error.message}`);
            res.status(500).json({ success: false, message: `Lỗi server: ${error.message}` });
        }
        else {
            console.error('Error updating address:', error);
            res.status(500).json({ success: false, message: 'Lỗi server không xác định' });
        }
    }
};
exports.updateUserAddress = updateUserAddress;
const deleteUserAddress = async (req, res) => {
    try {
        const { id, index } = req.params;
        // Kiểm tra id hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ!'
            });
            return;
        }
        // Kiểm tra index hợp lệ
        const addressIndex = parseInt(index, 10);
        if (isNaN(addressIndex) || addressIndex < 0) {
            res.status(400).json({
                success: false,
                message: 'Index địa chỉ không hợp lệ!'
            });
            return;
        }
        // Tìm user
        const user = await user_model_js_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        // Kiểm tra index có nằm trong mảng address không
        if (!user.address || addressIndex >= user.address.length) {
            res.status(400).json({
                success: false,
                message: 'Địa chỉ không tồn tại!'
            });
            return;
        }
        // Xóa địa chỉ tại vị trí index
        user.address.splice(addressIndex, 1);
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Xóa địa chỉ thành công',
            user: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting address: ${error.message}`);
            res.status(500).json({ success: false, message: `Lỗi server: ${error.message}` });
        }
        else {
            console.error('Error deleting address:', error);
            res.status(500).json({ success: false, message: 'Lỗi server không xác định' });
        }
    }
};
exports.deleteUserAddress = deleteUserAddress;
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        // Kiểm tra đầu vào
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới!'
            });
            return;
        }
        // Kiểm tra id hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ!'
            });
            return;
        }
        // Tìm user
        const user = await user_model_js_1.default.findById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
            return;
        }
        // Kiểm tra xem user có mật khẩu hay không
        if (!user.password) {
            res.status(400).json({
                success: false,
                message: 'Tài khoản của bạn chưa có mật khẩu. Vui lòng thiết lập mật khẩu trước!'
            });
            return;
        }
        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng!'
            });
            return;
        }
        // Mã hóa mật khẩu mới
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        // Lưu user với mật khẩu mới
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công!',
            user: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error changing password: ${error.message}`);
            res.status(500).json({ success: false, message: `Lỗi server: ${error.message}` });
        }
        else {
            console.error('Error changing password:', error);
            res.status(500).json({ success: false, message: 'Lỗi server không xác định' });
        }
    }
};
exports.changePassword = changePassword;
// Lấy danh sách người dùng mới
const getNewUsers = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Truy vấn người dùng mới trong 30 ngày qua
        const newUsers = await user_model_js_1.default
            .find({
            $or: [
                { createdAt: { $gte: thirtyDaysAgo } }, // Người dùng mới tạo
                { googleId: { $exists: true } } // Người dùng đăng nhập qua Google
            ]
        })
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(4);
        res.status(200).json({ success: true, result: newUsers });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching new users: ${error.message}`);
        }
        else {
            console.error('Error fetching new users:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getNewUsers = getNewUsers;
const setDefaultAddress = async (req, res) => {
    try {
        const { id, index } = req.params;
        // Kiểm tra id hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID người dùng không hợp lệ!'
            });
            return;
        }
        // Kiểm tra index hợp lệ
        const addressIndex = parseInt(index, 10);
        if (isNaN(addressIndex) || addressIndex < 0) {
            res.status(400).json({
                success: false,
                message: 'Index địa chỉ không hợp lệ!'
            });
            return;
        }
        // Tìm user
        const user = await user_model_js_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        // Kiểm tra index có nằm trong mảng address không
        if (!user.address || addressIndex >= user.address.length) {
            res.status(400).json({
                success: false,
                message: 'Địa chỉ không tồn tại!'
            });
            return;
        }
        // Đặt tất cả địa chỉ thành không mặc định, sau đó đặt địa chỉ được chọn thành mặc định
        user.address = user.address.map((addr, idx) => ({
            ...addr,
            isDefault: idx === addressIndex
        }));
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Đặt địa chỉ mặc định thành công',
            user: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error setting default address: ${error.message}`);
            res.status(500).json({ success: false, message: `Lỗi server: ${error.message}` });
        }
        else {
            console.error('Error setting default address:', error);
            res.status(500).json({ success: false, message: 'Lỗi server không xác định' });
        }
    }
};
exports.setDefaultAddress = setDefaultAddress;
// người dùng thân thiết
const getLoyalUsers = async (req, res) => {
    try {
        const loyalUsers = await order_model_js_1.default.aggregate([
            {
                $match: {
                    status: 'DELIVERED',
                    userID: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: 'orderdetails',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'orderDetails'
                }
            },
            {
                $unwind: '$orderDetails'
            },
            {
                $group: {
                    _id: '$userID',
                    totalQuantity: { $sum: '$orderDetails.quantity' },
                    fullname: { $first: '$inforUserGuest.fullName' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    _id: 0, // Loại bỏ _id của group
                    userId: '$_id',
                    fullname: { $ifNull: ['$userInfo.fullname', '$fullname', 'Khách vãng lai'] },
                    totalQuantity: 1,
                    email: '$userInfo.email',
                    createdAt: '$userInfo.createdAt'
                    // Không cần khai báo password: 0 vì nó sẽ tự động bị loại bỏ
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 4
            }
        ]);
        res.status(200).json({ success: true, result: loyalUsers });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching loyal users: ${error.message}`);
        }
        else {
            console.error('Error fetching loyal users:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.getLoyalUsers = getLoyalUsers;
//# sourceMappingURL=user.controllers.js.map