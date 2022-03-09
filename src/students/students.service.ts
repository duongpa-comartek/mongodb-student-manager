import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ClassesService } from 'src/classes/classes.service';
import { Class, ClassSchema } from 'src/classes/schemas/class.schema';
import { CreateStudentDto, UpdateStudentDto } from './dto';
import { Student, StudentDocument } from './schemas/student.schema';

@Injectable()
export class StudentsService {
    constructor(
        @InjectModel(Student.name)
        private readonly studentModel: Model<StudentDocument>,

        private readonly classService: ClassesService,
    ) { }

    async findAll(): Promise<Student[]> {
        return await this.studentModel.find().exec();
    }

    async findOneById(id: string): Promise<Student> {
        return await this.studentModel.findById(id).populate('class').exec();
    }

    async create(create: CreateStudentDto): Promise<Student> {
        const student = await new this.studentModel(create).save();
        const _class = await this.classService.findOneById(create.class);
        await this.classService.update(create.class, {
            totalMember: ++_class.totalMember,
            students: [..._class.students, student]
        });
        return student;
    }

    async update(id: string, update: UpdateStudentDto): Promise<Student> {
        //Nếu student thay lớp thì phải cập nhập ở danh sánh class.
        if (update.class) {
            const oldStudent = await this.studentModel.findById(id).populate('class').exec();
            const oldClass = oldStudent.class;
            const newClass = await this.classService.findOneById(update.class);
            const arrStudentInOldClass = oldClass.students as Student[];
            const index = arrStudentInOldClass.indexOf(oldStudent);

            //Cập nhập class cũ
            arrStudentInOldClass.splice(index, 1);
            await this.classService.update(String(oldClass._id), {
                totalMember: --oldClass.totalMember,
                students: arrStudentInOldClass
            })

            //Cập nhập class mới và student
            const newStudent = await this.studentModel.findByIdAndUpdate(id, update).exec();
            await this.classService.update(update.class, {
                totalMember: ++newClass.totalMember,
                students: [...newClass.students, newStudent]
            });
            return newStudent;
        }
        return await this.studentModel.findByIdAndUpdate(id, update).exec();
    }

    async delete(id: string): Promise<Student> {
        const student = await this.studentModel.findById(id).populate('class').exec();
        const _class = student.class;
        const arrStudent = _class.students as Student[];
        const index = arrStudent.indexOf(student);
        arrStudent.splice(index, 1);
        await this.classService.update(String(_class._id), {
            totalMember: --_class.totalMember,
            students: arrStudent
        });
        return await this.studentModel.findByIdAndDelete(id).exec();
    }

    async findStudentsInClass(id: string): Promise<Student[]> {
        return await this.studentModel.find()
    }

    async getAvgScore(id: string): Promise<number> {
        const student = await this.studentModel.findById(id).populate('scores').exec();
        const arrScore = student.scores;
        return arrScore ? arrScore.reduce((result, { score }) => result + score, 0) / arrScore.length : 0;
    }
}
