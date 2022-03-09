import { IsString } from 'class-validator';

export class DeleteClassDto {
    @IsString()
    readonly id: string;
}
