import jwt from 'jsonwebtoken';
import ENV_VARS from '../config.js';
export const generateAccessToken = async (userId, res) => {
    if (!ENV_VARS.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
        expiresIn: '1d'
    });
    return token;
};
export const generateRefreshToken = async (userId, res) => {
    if (!ENV_VARS.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const refreshToken = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
        expiresIn: '7d'
    });
    return refreshToken;
};
//# sourceMappingURL=jwt.js.map