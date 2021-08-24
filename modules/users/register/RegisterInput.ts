import { Field, InputType } from "type-graphql";
import { Length, IsEmail } from "class-validator";
import { IsEmailAlreadyExist } from "./IsEmailAlreadyExists";

@InputType()
export class RegisterInput {
    @Field()
    @Length(1, 100)
    username: string;

    @Field()
    @IsEmail()
    @IsEmailAlreadyExist({
        message: "A user with that email address already exists!",
    })
    email: string;

    @Field()
    @Length(1, 100)
    password: string;
}
