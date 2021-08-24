import { Query, Mutation, Arg, Resolver, Ctx, Authorized } from "type-graphql";
import bcrypt from "bcryptjs";
import { Role, User } from "../../entities/Users";
import { RegisterInput } from "./register/RegisterInput";
import { genAccessToken, genRefreshToken } from "../../utils/authMiddleware";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class UserResolver {
    @Authorized(Role.public)
    @Query(() => [User])
    async allUsers(): Promise<User[] | null> {
        return await User.find();
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
        try {
            ctx.res.clearCookie("accessToken");
            ctx.res.clearCookie("refreshToken");
            return true;
        } catch {
            return false;
        }
    }

    @Mutation(() => Boolean)
    async deleteUser(
        @Arg("id") id: number,
        @Ctx() ctx: MyContext
    ): Promise<boolean> {
        try {
            if (ctx.req.user_id === id) {
                ctx.res.clearCookie("accessToken");
                ctx.res.clearCookie("refreshToken");
            }
            await User.delete(id);
            return true;
        } catch {
            console.log("Could not delete the user");
            return false;
        }
    }

    @Mutation(() => User)
    async addUser(
        @Arg("input") { username, email, password }: RegisterInput,
        @Ctx() ctx: MyContext
    ): Promise<User | null> {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await User.create({
                username,
                email,
                password: hashedPassword,
            }).save();

            ctx.res.cookie(
                "refreshToken",
                await genRefreshToken(user.id, user.role),
                {
                    sameSite: "none",
                    secure: true,
                }
            );
            ctx.res.cookie(
                "accessToken",
                await genAccessToken(user.id, user.role),
                {
                    sameSite: "none",
                    secure: true,
                }
            );

            return user;
        } catch (err) {
            return null;
        }
    }
}
