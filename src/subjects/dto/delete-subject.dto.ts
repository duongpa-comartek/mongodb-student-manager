import { IsString } from 'class-validator';

export class DeleteSubjectDto {
    @IsString()
    readonly id: string
}
