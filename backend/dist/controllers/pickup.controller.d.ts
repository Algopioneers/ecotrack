import { Request, Response, NextFunction } from 'express';
export declare const createPickupRequest: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserPickupRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPickupRequestById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePickupRequest: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllPickupRequests: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=pickup.controller.d.ts.map