import { Request, Response } from 'express';
export declare const getOrderDetails: (req: Request, res: Response) => Promise<void>;
export declare const getOrderDetailsByOrderId: (req: Request, res: Response) => Promise<void>;
export declare const createOrderDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateOrderDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteOrderDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
