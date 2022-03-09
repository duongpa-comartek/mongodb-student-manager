import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { Class } from 'src/classes/schemas/class.schema';
import { Score } from 'src/scores/schemas/score.schema';

export type StudentDocument = Student & Document;

@Schema()
export class Student {
    @Transform(({ value }) => value.toString())
    _id: mongoose.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    dob: Date;

    @Prop({ required: true })
    gender: string;

    @Prop({ required: true })
    email: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class' })
    class: Class;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Score' }] })
    scores: Score[];
}

const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.methods.getAvgScore = function () {
    return this.scores ? this.scores.reduce((result, { score }) => result + score, 0) / this.scores.length : 0;
};

StudentSchema.methods.getOutcome = function () {
    const avg = this.scores ? this.scores.reduce((result, { score }) => result + score, 0) / this.scores.length : 0;
    if (avg >= 8) return 'GOOD';
    else if (avg > 5 && avg < 8) return 'AVG';
    else return 'BAD';
};

export { StudentSchema };