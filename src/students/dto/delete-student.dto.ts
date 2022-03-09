import { IsNumberString, IsString } from 'class-validator';

export class DeleteStudentDto {
    @IsString()
    readonly id: string;
}
