import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ClassesService } from 'src/classes/classes.service';
import { Class, ClassSchema } from 'src/classes/schemas/class.schema';
import { Score } from 'src/scores/schemas/score.schema';
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
        await this.classService.updatePushOneStudent(create.class, student);
        return student;
    }

    async update(id: string, update: UpdateStudentDto): Promise<Student> {
        //Nếu student thay lớp thì phải cập nhập ở danh sánh class.
        let newStudent;
        if (update.class) {
            const student = await this.studentModel.findById(id).populate('class').exec();
            const oldClass = student.class;

            //Cập nhập class cũ
            await this.classService.updateDeleteOneStudent(String(oldClass._id), String(student._id));

            //Cập nhập class mới và student
            newStudent = await this.studentModel.findByIdAndUpdate(id, update).exec();
            await this.classService.updatePushOneStudent(update.class, newStudent);
            return newStudent;
        }
        return await this.studentModel.findByIdAndUpdate(id, update).exec();
    }

    async updatePushOneScore(id: string, score: Score) {
        return await this.studentModel.findByIdAndUpdate(id, {
            $push: { scores: score }
        });
    }

    async updateDeleteOneScore(id: string, scoreId: string) {
        return await this.studentModel.findByIdAndUpdate(id, {
            $pullAll: {
                scores: [{ _id: scoreId }]
            }
        });
    }

    async delete(id: string): Promise<Student> {
        const student = await this.studentModel.findById(id).populate('class').exec();
        const _class = student.class;
        await this.classService.updateDeleteOneStudent(String(_class._id), String(student._id));
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
