import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export declare const getAllBlogCategory: (req: Request, res: Response) => Promise<void>;
export declare const insertBlogCategory: (req: Request, res: Response) => Promise<void>;
export declare const getBlogCategoryById: (req: Request, res: Response) => Promise<void>;
export declare const updateBlogCategory: (req: Request, res: Response) => Promise<void>;
export declare const getBlogCategoriesActive: (req: Request, res: Response) => Promise<void>;
export declare const deleteBlogCategory: (req: Request, res: Response) => Promise<void>;
export declare const toggleBlogCategory: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
