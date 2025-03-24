import { Request, Response } from 'express';
export declare const createService: (req: Request, res: Response) => Promise<void>;
export declare const getAllServices: (req: Request, res: Response) => Promise<void>;
export declare const getServiceActive: (req: Request, res: Response) => Promise<void>;
export declare const getServiceById: (req: Request, res: Response) => Promise<void>;
export declare const updateService: (req: Request, res: Response) => Promise<void>;
