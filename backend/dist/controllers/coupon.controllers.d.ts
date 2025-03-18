import { Request, Response } from 'express';
export declare const getAllCoupon: (req: Request, res: Response) => Promise<void>;
export declare const getCouponById: (req: Request, res: Response) => Promise<void>;
export declare const createCoupon: (req: Request, res: Response) => Promise<void>;
export declare const deleteCouponById: (req: Request, res: Response) => Promise<void>;
export declare const updateCoupon: (req: Request, res: Response) => Promise<void>;
export declare const applyCoupon: (req: Request, res: Response) => Promise<void>;
export declare const getActiveCoupons: (req: Request, res: Response) => Promise<void>;
