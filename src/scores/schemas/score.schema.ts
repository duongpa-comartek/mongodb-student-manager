import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Student } from 'src/students/schemas/student.schema';
import { Subject } from 'src/subjects/schemas/subject.schema';

export type ScoreDocument = Score & Document;

@Schema()
export class Score {
    @Prop({ required: true })
    score: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student' })
    student: Student;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' })
    subject: Subject;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);