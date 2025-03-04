import { Request, Response } from 'express';
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
