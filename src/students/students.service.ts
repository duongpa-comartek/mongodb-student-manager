import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ClassesService } from 'src/classes/classes.service';
import { Score } from 'src/scores/schemas/score.schema';
import { CreateStudentDto, UpdateStudentDto, FilterOutcomeDto, CheckExistStudentDto } from './dto';
import { Student, StudentDocument, StudentResult } from './schemas/student.schema';
import { CreateStudentInput, FindStudentArgs } from './input';

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

    async findOneById(id: string | ObjectId): Promise<Student> {
        return await this.studentModel.findById(id).exec();
    }

    async findStudentInClass(id: string | ObjectId) {
        return await this.studentModel.find({ class: id }).exec();
    }

    async findClassByStudent(_id: string | ObjectId) {
        const result = await this.studentModel.findById(_id).populate('class').lean().exec();
        return result.class;
    }

    async create(create: CreateStudentInput): Promise<Student> {
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

    async delete(id: string | ObjectId): Promise<Student> {
        const student = await this.studentModel.findById(id).populate('class').exec();
        const _class = student.class;
        await this.classService.updateDeleteOneStudent(String(_class._id), String(student._id));
        return await this.studentModel.findByIdAndDelete(id).exec();
    }

    async getAvgScore(id: string): Promise<number> {
        const student = await this.studentModel.findById(id).populate('scores').exec();
        const arrScore = student.scores;
        return arrScore ? arrScore.reduce((result, { score }) => result + score, 0) / arrScore.length : 0;
    }

    async checkExist(checkExistStudentDto: CheckExistStudentDto) {
        const student = await this.studentModel.findOne(checkExistStudentDto).exec();
        return Boolean(student);
    }

    async getStudentsByIds(ids: ObjectId[]): Promise<Student[]> {
        return await this.studentModel.find({
            _id: { $in: ids }
        }).exec();
    }

    async getStudentsInClassByIds(_id: ObjectId): Promise<StudentResult> {
        const listStudent = await this.studentModel.find({ class: _id }).exec();
        const outcome: StudentResult = {
            key: String(_id),
            result: listStudent
        }
        return outcome;
    }

    async search({ _id, name, dob, email, gender, class: _class }: FindStudentArgs) {
        if (_id) {
            return await this.studentModel.findById(_id).exec();
        }
        const condition = [];
        if (name) condition.push({ name: name });
        if (dob) condition.push({ dob: dob });
        if (email) condition.push({ email: email });
        if (gender) condition.push({ gender: gender });
        if (_class) condition.push({ class: _class });
        return await this.studentModel.find({
            $or: condition
        }).lean().exec();
    }
}
