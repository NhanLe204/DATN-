import { Response } from 'express';
export declare const generateAccessToken: (userId: string, res: Response) => Promise<any>;
export declare const generateRefreshToken: (userId: string, res: Response) => Promise<any>;
