import { Request, Response } from 'express';
export declare const createBlog: (req: Request, res: Response) => Promise<void>;
export declare const getAllBlogs: (req: Request, res: Response) => Promise<void>;
export declare const getActiveBlogs: (req: Request, res: Response) => Promise<void>;
export declare const getBlogById: (req: Request, res: Response) => Promise<void>;
export declare const updateBlog: (req: Request, res: Response) => Promise<void>;
export declare const deleteBlog: (req: Request, res: Response) => Promise<void>;
