import { IsString } from 'class-validator'

export class DeleteScoreDto {
    @IsString()
    id: string;
}
