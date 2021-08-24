import { CookieOptions, Request, Response } from "express";

export interface Req extends Request {
    user_id?: number;
    user_role?: string;
}

export interface MyContext {
    req: Req;
    res: Response;
}
