import { IsMongoId, IsNumberString, IsString } from 'class-validator';
import { ObjectId } from 'mongoose'

export class DeleteStudentDto {
    @IsMongoId()
    readonly id: string | ObjectId;
}
