import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
export interface CustomRequest extends Request {
    user?: IUser;
}
export declare const createRating: (req: CustomRequest, res: Response) => Promise<void>;
export declare const getRatingByProductId: (req: Request, res: Response) => Promise<void>;
export declare const getRatingByUserId: (req: Request, res: Response) => Promise<void>;
