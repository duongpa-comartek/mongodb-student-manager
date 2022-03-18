import { Field, ArgsType, InputType, ID } from '@nestjs/graphql';
import { IsDate, IsEmail, IsEnum, IsMongoId, IsOptional, IsString, Length } from 'class-validator';
import { ObjectId } from 'mongoose';

@ArgsType()
export class FindStudentArgs {
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
    @IsDate()
    @IsOptional()
    dob?: Date;

    @Field({ nullable: true })
    @IsEnum({
        MALE: 'Male',
        FEMALE: 'Female',
        OTHER: 'Other',
    })
    @IsOptional()
    gender?: string;

    @Field({ nullable: true })
    @IsEmail()
    @IsOptional()
    email?: string;

    @Field({ nullable: true })
    @IsMongoId()
    @IsOptional()
    class?: string;
}
