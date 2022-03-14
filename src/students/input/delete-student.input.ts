import { Field, InputType, ID } from "@nestjs/graphql";
import { IsMongoId } from "class-validator";
import { ObjectId } from 'mongoose';

@InputType()
export class DeleteStudentInput {
    @Field(type => ID)
    @IsMongoId()
    _id: string;
}