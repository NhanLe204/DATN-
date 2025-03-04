import { Request, Response, NextFunction } from 'express';
import { IUser } from '../interfaces/user.interface.js';
interface AuthenticatedRequest extends Request {
    user?: IUser;
    token?: string;
}
export declare const verifyToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
