import { Expose, Type, TypeOptions } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsDate, IsEmail, Length, IsObject } from 'class-validator';
import mongoose from 'mongoose';
import { Class } from 'src/classes/schemas/class.schema';

export class CreateStudentDto {
    @IsString()
    @Length(10, 100)
    readonly name: string;

    @Type(() => Date)
    @IsDate()
    readonly dob: Date;

    @IsEnum({
        MALE: 'Male',
        FEMALE: 'Female',
        OTHER: 'Other',
    })
    readonly gender: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    readonly class: string;
}
