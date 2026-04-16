import { Request, Response, NextFunction } from 'express';
export declare const startConversation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendChatMessage: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getConversationHistory: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rateConversation: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserConversations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getWaitingConversations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignAgent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=chatbot.controller.d.ts.map