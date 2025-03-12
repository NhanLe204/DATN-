import { Request, Response } from 'express';
export declare const getAllRatings: (req: Request, res: Response) => Promise<void>;
export declare const getRatingID: (req: Request, res: Response) => Promise<void>;
export declare const createRating: (req: Request, res: Response) => Promise<void>;
export declare const updateRating: (req: Request, res: Response) => Promise<void>;
export declare const deleteRating: (req: Request, res: Response) => Promise<void>;
