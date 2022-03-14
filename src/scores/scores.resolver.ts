import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Subject } from 'src/subjects/schemas/subject.schema';
import { Student } from 'src/students/schemas/student.schema';
import { StudentsService } from 'src/students/students.service';
import { SubjectsService } from 'src/subjects/subjects.service';
import { FindScoreInput, CreateScoreInput, UpdateScoreInput, DeleteScoreInput } from './input/index';
import { Score } from './schemas/score.schema';
import { ScoresService } from './scores.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';

@Resolver(of => Score)
export class ScoresResolver {
    constructor(
        private readonly scoresService: ScoresService,
        private readonly studentsService: StudentsService,
        private readonly subjectsService: SubjectsService
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
    async addScore(@Args('createScoreInput') createScoreInput: CreateScoreInput) {
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
        return this.scoresService.create(createScoreInput);
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
}   
