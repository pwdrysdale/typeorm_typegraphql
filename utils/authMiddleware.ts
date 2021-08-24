import { AuthChecker } from "type-graphql";
import { User } from "../entities/Users";
import { MyContext } from "../types/MyContext";

const jwt = require("jsonwebtoken");

export const genRefreshToken = (user_id: number, user_role: string) => {
    return jwt.sign(
        { user_id, user_role },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: "7d",
        }
    );
};

export const genAccessToken = (user_id: number, user_role: string) => {
    return jwt.sign(
        { user_id, user_role },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: "10s",
        }
    );
};

export const authMiddleware = async (req: any, res: any, next: any) => {
    const accessToken = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken && !accessToken) {
        return next();
    }

    try {
        const data = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET as string
        );
        req.user_id = data.user_id;
        req.user_role = data.user_role;
        return next();
    } catch {}

    if (!refreshToken) {
        return next();
    }

    let data;

    try {
        data = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        );
    } catch {
        return next();
    }
    let user = await User.findOne(data.user_id);

    if (!user) {
        return next();
    }

    req.user_id = data.user_id;
    req.user_role = data.user_role;
    res.cookie(
        "refreshToken",
        await genRefreshToken(data.user_id, data.user_role),
        {
            sameSite: "none",
            secure: true,
        }
    );
    res.cookie(
        "accessToken",
        await genAccessToken(data.user_id, data.user_role),
        {
            sameSite: "none",
            secure: true,
        }
    );

    next();
};

export const authChecker: AuthChecker<MyContext> = async (
    { context },
    roles
) => {
    if (roles.length === 0) {
        return context.req.user_id !== undefined;
    }
    if (!context.req.user_id) {
        return false;
    }

    if (context.req.user_role && roles.includes(context.req.user_role)) {
        return true;
    }

    return false;
};
