import { Response } from 'express';
export declare const generateAccessToken: (userId: string, res: Response) => Promise<string>;
export declare const generateRefreshToken: (userId: string, res: Response) => Promise<string>;
