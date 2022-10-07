import { NextApiRequest, NextApiResponse } from "next";
import { Override } from "./types";

type APIErrorResponse = {
  error: string;
};

export type APIResponse<T = {}> = NextApiResponse<T | APIErrorResponse>;

export type APIRequest<T = {}> = Override<NextApiRequest, { body: T }>;
