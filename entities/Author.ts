import { Field, ID, ObjectType } from "type-graphql";
import {
    OneToMany,
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./Books";
import { Lazy } from "../types/Lazy";

@ObjectType()
@Entity()
export class Author extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @OneToMany(() => Book, (book) => book.author, { lazy: true })
    @Field(() => [Book])
    books: Lazy<Book[]>;
}
