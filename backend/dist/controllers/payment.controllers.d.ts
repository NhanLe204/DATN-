import { Request, Response } from 'express';
export declare const createPaymentLink: (req: Request, res: Response) => Promise<void>;
export declare const handlePaymentWebhook: (req: Request, res: Response) => Promise<void>;
export declare const getOrderByOrderId: (req: Request, res: Response) => Promise<void>;
