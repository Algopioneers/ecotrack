import { Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';
export declare const setupTrackingSocket: (io: SocketIOServer) => void;
export declare const getCollectorLocation: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRoute: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=tracking.controller.d.ts.map