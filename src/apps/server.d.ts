import express from 'express';
import { BusinessSpine } from '../core/business-spine.js';
export declare class ApiServer {
    private app;
    private spine;
    private logger;
    constructor(spine: BusinessSpine);
    private setupMiddleware;
    private setupRoutes;
    start(): Promise<void>;
    getApp(): express.Application;
}
//# sourceMappingURL=server.d.ts.map