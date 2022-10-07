import { NextApiRequest } from "next";
import { Override } from "./types";

export type APIErrorResponse = {
  error: string;
};

export type APIRequest<T> = Override<NextApiRequest, { body: T }>;
