import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from 'src/students/schemas/student.schema';
import { CreateClassDto, UpdateClassDto } from './dto/index';
import { Class, ClassDocument, ClassSchema } from './schemas/class.schema';

@Injectable()
export class ClassesService {
    constructor(
        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>
    ) { }

    async findAll(): Promise<Class[]> {
        return await this.classModel.find().exec();
    }

    async findOneById(id: string): Promise<Class> {
        return await this.classModel.findById(id).populate('students').exec();
    }

    async create(create: CreateClassDto): Promise<Class> {
        return await new this.classModel(create).save();
    }

    async update(id: string, update: UpdateClassDto): Promise<Class> {
        return await this.classModel.findByIdAndUpdate(id, update).populate('students').exec();
    }

    async delete(id: string): Promise<Class> {
        return await this.classModel.findByIdAndDelete(id).exec();
    }
}
