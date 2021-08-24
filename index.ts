import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express, { Response } from "express";
import cors, { CorsOptions } from "cors";
import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { authChecker, authMiddleware } from "./utils/authMiddleware";

import { BookResolver } from "./modules/book/BookResolver";
import { UserResolver } from "./modules/users/UserResolver";
import { AuthorResolver } from "./modules/author/AuthorResolver";

import { Req } from "./types/MyContext";

const main = async () => {
    dotenv.config();
    await createConnection();

    const schema: GraphQLSchema = await buildSchema({
        resolvers: [UserResolver, BookResolver, AuthorResolver],
        authChecker: authChecker,
    });

    const server = new ApolloServer({
        schema,
        context: ({ req, res }: { req: Req; res: Response }) => ({
            req,
            res,
        }),
        formatResponse: (response, requestContext) => {
            if (requestContext.response && requestContext.response.http) {
                requestContext.response.http.headers.set(
                    "Access-Control-Allow-Origin",
                    "https://studio.apollographql.com"
                );
                requestContext.response.http.headers.set(
                    "Access-Control-Allow-Credentials",
                    "true"
                );
            }
            return response;
        },
    });

    const app = express();

    await server.start();

    const allowedOrigins = [
        "https://studio.apollographql.com",
        "http://localhost:3000",
        "http://localhost:4000/graphql",
        "http://localhost:4000",
    ];

    const corsOptions: CorsOptions = {
        credentials: true,
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin || "invalid"))
                return callback(null, true);

            callback(new Error(`Not allowed by CORS: ${origin}`));
        },
    };

    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(authMiddleware);

    server.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log("Server started on 4000");
    });

    return { server, app };
};

main();
