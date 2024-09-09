import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode: number;
  message: string;
}

export const handleError = (err: AppError, req: Request, res: Response) => {
  // Syntax: parameter: error, req, res
  const statusCode = err.statusCode || 500;
  const Status = err.message || "`Something went wrong`";
  res.status(statusCode).json({
    statusCode,
    status: Status,
    message: err.message || "Internet Error",
  });
};
