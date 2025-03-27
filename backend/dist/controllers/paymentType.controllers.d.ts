import { Request, Response } from 'express';
export declare const getAllPayments: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentById: (req: Request, res: Response) => Promise<void>;
export declare const insertPayment: (req: Request, res: Response) => Promise<void>;
export declare const updatePayment: (req: Request, res: Response) => Promise<void>;
export declare const deletePayments: (req: Request, res: Response) => Promise<void>;
