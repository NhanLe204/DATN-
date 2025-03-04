import { Request, Response, RequestHandler, NextFunction } from 'express';
import { IUser } from '../interfaces/user.interface.js';
export interface CustomRequest extends Request {
    user?: IUser;
}
export declare const signupController: (req: Request, res: Response) => Promise<void>;
export declare const loginController: (req: Request, res: Response) => Promise<void>;
export declare const logoutController: (req: Request, res: Response) => Promise<void>;
export declare const authCheckController: (req: Request & {
    user?: {
        _id: string;
        email: string;
        role: string;
    };
    token?: string;
}, res: Response) => Promise<void>;
export declare const forgotPasswordController: (req: Request, res: Response) => Promise<void>;
export declare const resetPasswordController: (req: Request, res: Response) => Promise<void>;
export declare const refreshTokenController: (req: Request, res: Response) => Promise<void>;
export declare const googleLogin: RequestHandler;
export declare const checkRoleStatus: (req: CustomRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkAdminRole: (req: CustomRequest, res: Response, next: NextFunction) => void;
