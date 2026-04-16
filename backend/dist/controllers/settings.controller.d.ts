import { Request, Response, NextFunction } from 'express';
export declare const getSettings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSettings: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadLogo: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadFavicon: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=settings.controller.d.ts.map