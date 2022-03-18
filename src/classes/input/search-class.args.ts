import { Field, InputType, ID, ArgsType } from "@nestjs/graphql";
import { IsMongoId, IsNumber, IsOptional, IsString, Length, MinLength } from "class-validator";
import { ObjectId } from 'mongoose';

@ArgsType()
export class FindClassArgs {
    @Field(type => ID, { nullable: true })
    @IsMongoId()
    @IsOptional()
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


    @Field({ nullable: true })
    @IsNumber()
    @IsOptional()
    totalMenber?: number;
}