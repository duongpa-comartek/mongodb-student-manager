import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
<<<<<<< HEAD
=======
import { Transform } from 'class-transformer';
>>>>>>> 8d4e74e85f2db901f5fec206e4570fac068fb0ad
import mongoose from 'mongoose';
import { Student } from 'src/students/schemas/student.schema';
import { Subject } from 'src/subjects/schemas/subject.schema';

export type ScoreDocument = Score & Document;

@Schema()
export class Score {
<<<<<<< HEAD
=======
    @Transform(({ value }) => value.toString())
    _id: mongoose.ObjectId;

>>>>>>> 8d4e74e85f2db901f5fec206e4570fac068fb0ad
    @Prop({ required: true })
    score: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student' })
    student: Student;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' })
    subject: Subject;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);