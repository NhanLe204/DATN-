import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export declare const getAllUser: (req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCart: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
