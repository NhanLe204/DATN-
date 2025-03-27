import { Request, Response } from 'express';
export declare const getAllDeliveries: (req: Request, res: Response) => Promise<void>;
export declare const getDeliveryById: (req: Request, res: Response) => Promise<void>;
export declare const insertDelivery: (req: Request, res: Response) => Promise<void>;
export declare const updateDelivery: (req: Request, res: Response) => Promise<void>;
export declare const deleteDelivery: (req: Request, res: Response) => Promise<void>;
