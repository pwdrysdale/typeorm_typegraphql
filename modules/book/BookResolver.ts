import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Book } from "../../entities/Books";
import { Author } from "../../entities/Author";

@Resolver()
export class BookResolver {
    @Query(() => String)
    helloWorld() {
        return "Hello, you are in the books resolver, so that is a thing";
    }

    @Query(() => Book)
    async book(@Arg("id") id: number): Promise<Book | null> {
        try {
            return (await Book.findOne(id)) || null;
        } catch {
            return null;
        }
    }

    @Query(() => [Book])
    async allBooks(): Promise<Book[] | null> {
        return await Book.find();
    }

    @Mutation(() => Book)
    async addBook(@Arg("title") title: string): Promise<Book | null> {
        return await Book.create({ title }).save();
    }

    @Mutation(() => Boolean)
    async deleteBook(@Arg("id") id: number): Promise<boolean> {
        const result = await Book.delete(id);
        return result ? true : false;
    }

    @Mutation(() => Boolean)
    async addAuthorToBook(
        @Arg("bookId") bookId: number,
        @Arg("authorId") authorId: number
    ): Promise<boolean> {
        try {
            const book = await Book.findOne(bookId);
            const author = await Author.findOne(authorId);
            if (book && author) {
                book.author = author;
                const status = await book.save();

                return status ? true : false;
            }
            return false;
        } catch {
            return false;
        }
    }
}
