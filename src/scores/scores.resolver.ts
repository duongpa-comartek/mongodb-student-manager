import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Subject } from 'src/subjects/schemas/subject.schema';
import { Student } from 'src/students/schemas/student.schema';
import { StudentsService } from 'src/students/students.service';
import { SubjectsService } from 'src/subjects/subjects.service';
import { FindScoreInput, CreateScoreInput, UpdateScoreInput, DeleteScoreInput } from './input/index';
import { Score, ScoreDocument } from './schemas/score.schema';
import { ScoresService } from './scores.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';
import * as XlsxTemplate from 'xlsx-template';
import * as fs from 'fs';
import { MailService } from 'src/mail/mail.service';
import { ExcelService } from 'src/excel/excel.service';
import Bull from 'bull';

@Resolver(of => Score)
export class ScoresResolver {
    constructor(
        private readonly scoresService: ScoresService,
        private readonly studentsService: StudentsService,
        private readonly subjectsService: SubjectsService,
        private readonly mailService: MailService,
        private readonly excelService: ExcelService
    ) { }

    @Query(() => [Score])
    async scores() {
        return this.scoresService.findAll();
    }

    @ResolveField('student', returns => Student)
    async getStudent(
        @Parent() parent: Score,
        @Context() { studentsLoaderById }: { studentsLoaderById: DataLoader<ObjectId, Student> }
    ) {
        return await studentsLoaderById.load(parent.student._id);
    }

    @ResolveField('subject', returns => Subject)
    async getSubject(
        @Parent() parent: Score,
        @Context() { subjectsLoaderById }: { subjectsLoaderById: DataLoader<ObjectId, Subject> }
    ) {
        return await subjectsLoaderById.load(parent.subject._id);
    }

    @Query(() => Score)
    async score(@Args('findScoreInput') { _id }: FindScoreInput) {
        return this.scoresService.findOneById(_id);
    }

    @Mutation(() => Score)
    async addScore(@Args('createScoreInput') { dateToSendMail, hourToSendMail, ...createScoreInput }: CreateScoreInput) {
        //Kiểm tra xem học sinh và môn học có tồn tại không
        const student = await this.studentsService.findOneById(createScoreInput.student);
        const subject = await this.subjectsService.findOneById(createScoreInput.subject);
        if (!subject || !student) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: `Bad Request: Student or Subject cannot found!`,
            }, HttpStatus.BAD_REQUEST);
        }

        // Nếu điểm đã tồn tại thì không thể thêm vào
        const hasScore = Boolean(await this.scoresService.findOneByStudentAndSubject(student, subject));
        if (hasScore) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: `Bad Request: Score already exists!`,
            }, HttpStatus.BAD_REQUEST);
        }
        const result = await this.scoresService.create(createScoreInput)
        if (result) await this.afterAddScore(result, student, subject, dateToSendMail, hourToSendMail);
        return result;
    }

    @Mutation(() => Score)
    async updateScore(@Args('updateScoreInput') updateScoreInput: UpdateScoreInput) {
        const { _id, ...update } = updateScoreInput;
        return this.scoresService.update(_id, update);
    }

    @Mutation(() => Score)
    async deleteScore(@Args('deleteScoreInput') { _id }: DeleteScoreInput) {
        return this.scoresService.delete(_id);
    }

    async afterAddScore(
        insertedScore: Score,
        student: Student,
        subject: Subject,
        dateToSendMail: Date,
        hourToSendMail: Boolean
    ) {
        const _class = await this.studentsService.findClassByStudent(student._id);
        const dataFile = await this.excelService.createExcelAddScore({
            class: _class.name,
            student: student,
            subject: subject.name,
            score: insertedScore.score
        });
        const start = new Date();

        //Thêm delay nếu nhập
        let jobOptions = {} as Bull.JobOptions;
        if (dateToSendMail) {
            console.log(dateToSendMail);
            jobOptions = {
                ...jobOptions,
                delay: dateToSendMail.getMilliseconds() - Date.now(),
            };
        }
        if (hourToSendMail) {
            jobOptions = {
                ...jobOptions,
                delay: 60 * 60 * 1000,
            };
        }

        this.mailService.sendEmailWithQueue({
            name: student.name,
            email: student.email,
            subject: subject.name,
            score: insertedScore.score,
            data: dataFile,
            jobOptions
        });
        return insertedScore;
    }
}   
