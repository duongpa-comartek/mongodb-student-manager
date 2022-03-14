import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Student } from 'src/students/schemas/student.schema';
import { UpdateClassDto } from './dto/index';
import { Class, ClassDocument, ClassSchema } from './schemas/class.schema';
import { idText } from '@ts-morph/common/lib/typescript';
import { CreateClassInput, UpdateClassInput, FindClassInput } from './input/index';

@Injectable()
export class ClassesService {
    constructor(
        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>
    ) { }

    async findAll(): Promise<Class[]> {
        return await this.classModel.find().lean();
    }

    async findOneById(id: string | ObjectId): Promise<Class> {
        return await this.classModel.findById(id).exec();
    }

    async findByName(name: string) {
        return await this.classModel.find({ name: name }).exec();
    }

    async create(create: CreateClassInput) {
        return await new this.classModel(create).save();
    }

    async update(id: string | ObjectId, update: UpdateClassDto): Promise<Class> {
        return await this.classModel.findByIdAndUpdate(id, update).exec();
    }

    async updatePushOneStudent(id: string | ObjectId, student: Student) {
        const _class = await this.classModel.findById(id).exec();
        return await this.classModel.findByIdAndUpdate(id, {
            $push: { students: student },
            $inc: { totalMember: 1 }
        });
    }

    async updateDeleteOneStudent(id: string, studentId: string) {
        const _class = await this.classModel.findById(id).exec();
        return await this.classModel.findByIdAndUpdate(id, {
            $pullAll: {
                students: [{ _id: studentId }]
            },
            $inc: { totalMember: -1 }
        });
    }

    async delete(id: string | ObjectId): Promise<Class> {
        return await this.classModel.findByIdAndDelete(id).exec();
    }

    async checkExist(_id: string | ObjectId) {
        return await this.classModel.exists({ _id: _id });
    }

    async search({ _id, name, teacherName }: FindClassInput) {
        return await this.classModel.find({ _id: _id, name: name, teacherName: teacherName }).exec();
    }
}
