import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export declare const getAllCategory: (req: Request, res: Response) => Promise<void>;
export declare const getCategoryById: (req: Request, res: Response) => Promise<void>;
export declare const insertCategory: (req: Request, res: Response) => Promise<void>;
export declare const updateCategory: (req: Request, res: Response) => Promise<void>;
export declare const toggleCategory: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
