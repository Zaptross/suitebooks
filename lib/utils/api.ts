import { NextApiRequest, NextApiResponse } from "next";
import logger from "../logger/logger";
import { Override } from "./types";

type APIErrorResponse = {
  error: string;
};

export type APIResponse<T = {}> = NextApiResponse<T | APIErrorResponse>;

export type APIRequest<T = {}> = Override<NextApiRequest, { body: T }>;

/**
 * Helper function to return a 400 response with a JSON body containing the error message
 */
export function badRequest(res: APIResponse<any>, error: Error) {
  res.status(400).json({ error: error.message });
}

/**
 * Helper function to log an error and return a basic 500 response
 */
export function internalServerError(
  req: APIRequest<any>,
  res: APIResponse<any>,
  error: Error
) {
  logger.error(req.method, req.url, (error as Error).message, error);
  res.status(500).json({ error: "Internal server error" });
}
