import { type Request, type Response, type NextFunction } from "express";
import { StatusCode } from "../enums/statusCode.enums";
import logger from "../utils/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
    const message = err.message || "Internal Server Error";

    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
