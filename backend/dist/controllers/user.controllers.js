import userModel from '../models/user.model.js';
// lấy hết nè má
export const getAllUser = async (req, res) => {
    try {
        const result = await userModel.find().select('-password');
        res.status(200).json({ success: true, result });
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
// Lấy user theo id nè má
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select('-password');
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
// Cập nhật user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id, 'ID');
        const { email, fullname, phone_number, address, role, avatar } = req.body;
        if (!email || !fullname || !phone_number || !address || !role || !avatar) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin người dùng'
            });
        }
        const updatedUser = await userModel.findByIdAndUpdate(id, { email, fullname, phone_number, address, role, avatar }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        res.status(200).json({ message: 'Người dùng đã được cập nhật thành công', user: updatedUser });
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
//# sourceMappingURL=user.controllers.js.map