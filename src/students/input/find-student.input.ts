import { Field, ArgsType, InputType, ID } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@InputType()
export class FindStudentInput {
    @Field(type => ID)
    _id !: ObjectId;

    // @Field({ nullable: true })
    // name?: string;
}