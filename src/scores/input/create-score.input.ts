import { Field, InputType } from '@nestjs/graphql';
import { MinLength, IsEnum, IsString, IsMongoId, IsNumber } from "class-validator";
import { ObjectId } from 'mongoose';

@InputType()
export class CreateScoreInput {
    @Field()
    @IsNumber()
    score!: number;

    @Field()
    @IsMongoId()
    student!: string;

    @Field()
    @IsMongoId()
    subject!: string;
}