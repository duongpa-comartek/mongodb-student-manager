import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Score, ScoreDocument } from './schemas/score.schema';
import { Model } from 'mongoose';
import { CreateScoreDto, UpdateScoreDto } from './dto/index';
import { Student } from 'src/students/schemas/student.schema';
import { Subject } from 'src/subjects/schemas/subject.schema';
import { StudentsService } from 'src/students/students.service';
import { SubjectsService } from 'src/subjects/subjects.service';

@Injectable()
export class ScoresService {
    constructor(
        @InjectModel(Score.name)
        private readonly scoreModel: Model<ScoreDocument>,
        private readonly studentsService: StudentsService,
        private readonly subjectsService: SubjectsService,
    ) { }

    async findAll(): Promise<Score[]> {
        return await this.scoreModel.find().exec();
    }

    async findOneById(id: string): Promise<Score> {
        return await this.scoreModel.findById(id).populate('student').populate('subject').exec();
    }

    async findOneByStudentAndSubject(student: Student, subject: Subject): Promise<Score> {
        return await this.scoreModel.findOne({ student: student, subject: subject }).exec();
    }

    async create(create: CreateScoreDto): Promise<Score> {
        const result = await new this.scoreModel(create).save();
        await this.studentsService.updatePushOneScore(create.student, result);
        await this.subjectsService.updatePushOneScore(create.subject, result);
        return result;
    }

    async update(id: string, update: UpdateScoreDto): Promise<Score> {
        return await this.scoreModel.findByIdAndUpdate(id, update).exec();
    }

    async delete(id: string): Promise<Score> {
        const score = await this.scoreModel.findById(id).populate('student').populate('subject').exec();
        const student = score.student;
        const subject = score.subject;
        await this.studentsService.updateDeleteOneScore(String(student._id), String(score._id));
        await this.subjectsService.updateDeleteOneScore(String(subject._id), String(score._id));
        return await this.scoreModel.findByIdAndDelete(id).exec();
    }
}
