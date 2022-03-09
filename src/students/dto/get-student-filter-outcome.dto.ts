import { IsEnum, IsNumberString, IsOptional, Max, Min } from "class-validator";

export type TypeOutcomes = "Good" | "Average" | "Bad";

export class GetStudentsFilterOutcome {
    @IsEnum({
        GOOD: 'Good',
        AVERAGE: 'Average',
        BAD: 'Bad',
    })
    readonly kindof: TypeOutcomes;

    @IsNumberString()
    @IsOptional()
    readonly limit?: number;

    @IsNumberString()
    @IsOptional()
    readonly offset?: number
}