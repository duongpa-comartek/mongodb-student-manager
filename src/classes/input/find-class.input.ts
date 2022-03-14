import { Field, InputType, ID } from "@nestjs/graphql";
import { IsMongoId, IsOptional, IsString, Length, MinLength } from "class-validator";
import { ObjectId } from 'mongoose';

@InputType()
export class FindClassInput {
    @Field(type => ID, { nullable: true })
    @IsMongoId()
    _id?: ObjectId;

    @Field({ nullable: true })
    @IsString()
    @Length(1, 50)
    @IsOptional()
    name?: string;

    @Field({ nullable: true })
    @IsString()
    @Length(1, 50)
    @IsOptional()
    teacherName?: string;
}