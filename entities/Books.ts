import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Author } from "./Author";
import { Lazy } from "../types/Lazy";

@ObjectType()
@Entity()
export class Book extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    title: string;

    @Field(() => Author, { nullable: true })
    @ManyToOne(() => Author, { lazy: true, nullable: true })
    author?: Lazy<Author>;
}
