import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class DeleteClassDto {
    @IsMongoId()
    readonly id: string | ObjectId;
}
