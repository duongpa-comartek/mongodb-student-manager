import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose from 'mongoose';
import { Document, ObjectId } from 'mongoose';
import { Student } from 'src/students/schemas/student.schema';

export type ClassDocument = Class & Document;

@Schema()
export class Class {
    @Transform(({ value }) => value.toString())
    _id: ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, default: 0 })
    totalMember: number;

    @Prop({ required: true })
    teacherName: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] })
    students: Student[];
}

const ClassSchema = SchemaFactory.createForClass(Class);


export { ClassSchema }