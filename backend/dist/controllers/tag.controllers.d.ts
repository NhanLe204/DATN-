import { Request, Response } from 'express';
export declare const getAllTags: (req: Request, res: Response) => Promise<void>;
export declare const getTagById: (req: Request, res: Response) => Promise<void>;
export declare const insertTag: (req: Request, res: Response) => Promise<void>;
export declare const deleteTag: (req: Request, res: Response) => Promise<void>;
export declare const updateTag: (req: Request, res: Response) => Promise<void>;
