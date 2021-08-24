import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Author } from "../../entities/Author";
import { Book } from "../../entities/Books";

@Resolver()
export class AuthorResolver {
    @Query(() => Author)
    async book(@Arg("id") id: number): Promise<Author | null> {
        try {
            return (await Author.findOne(id)) || null;
        } catch {
            return null;
        }
    }

    @Query(() => [Author])
    async allAuthors(): Promise<Author[] | null> {
        return await Author.find();
    }

    @Query(() => [Book])
    async booksByAuthor(@Arg("id") id: number): Promise<Book[]> {
        const author = await Author.findOne(id, { relations: ["books"] });
        return author ? author.books : [];
    }

    @Mutation(() => Author)
    async addAuthor(@Arg("name") name: string): Promise<Author> {
        return await Author.create({ name }).save();
    }

    @Mutation(() => Boolean)
    async deleteAuthor(@Arg("id") id: number): Promise<boolean> {
        const result = await Author.delete(id);
        return result ? true : false;
    }
}
