import jwt from 'jsonwebtoken';
import ENV_VARS from '../config.js';
import userModel from '../models/user.model.js';
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader ? authHeader.split(' ')[1] : '';
        if (!ENV_VARS.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
        if (!ENV_VARS.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        const user = await userModel.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        console.error('Error in verifyToken middleware:', error);
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }
};
//# sourceMappingURL=verifyToken.js.map