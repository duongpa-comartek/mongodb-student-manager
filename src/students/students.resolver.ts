import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ClassesService } from 'src/classes/classes.service';
import { Class } from 'src/classes/schemas/class.schema';
import { Score, ScoreResult } from 'src/scores/schemas/score.schema';
import { ScoresService } from 'src/scores/scores.service';
import { Student } from './schemas/student.schema';
import { StudentsService } from './students.service';
import { FindStudentInput, CreateStudentInput, UpdateStudentInput, DeleteStudentInput } from './input/index'
import { HttpException, HttpStatus } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';

@Resolver(of => Student)
export class StudentsResolver {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly classesService: ClassesService,
        private readonly scoresService: ScoresService
    ) { }

    @Query(() => [Student])
    async students() {
        return this.studentsService.findAll();
    }

    @ResolveField('class', returns => Class)
    async getClass(
        @Parent() parent: Student,
        @Context() { classesLoaderById }: { classesLoaderById: DataLoader<ObjectId, Class> }
    ) {
        return classesLoaderById.load(parent.class._id);
    }

    @ResolveField('scores', returns => [Score])
    async getScores(
        @Parent() parent: Student,
        @Context() { scoresLoaderByStudent }: { scoresLoaderByStudent: DataLoader<ObjectId, ScoreResult> }
    ) {
        return (await scoresLoaderByStudent.load(parent._id)).result;
    }

    @Query(() => Student)
    async student(@Args('findStudentInput') { _id }: FindStudentInput) {
        return this.studentsService.findOneById(_id);
    }

    @Mutation(() => Student)
    async addStudent(@Args('createStudentInput') createStudentInput: CreateStudentInput) {
        const _class = await this.classesService.findOneById(createStudentInput.class);
        if (!_class) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST, error: `Bad Request: Class cannot found!`,
            }, HttpStatus.BAD_REQUEST);
        }
        return this.studentsService.create(createStudentInput);
    }

    @Mutation(() => Student)
    async updateStudent(@Args('updateStudentInput') updateStudentInput: UpdateStudentInput) {
        const { _id, ...update } = updateStudentInput;
        const _class = await this.classesService.findOneById(update.class);
        if (!_class) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST, error: `Bad Request: Class cannot found!`,
            }, HttpStatus.BAD_REQUEST);
        }
        return this.studentsService.update(_id, update);
    }

    @Mutation(() => Student)
    async deleteStudent(@Args('deleteStudentInput') deleteStudentInput: DeleteStudentInput) {
        const score = this.scoresService.checkExist({ student: deleteStudentInput._id });
        if (score) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST, error: `Bad Request: Student has scores!`,
            }, HttpStatus.BAD_REQUEST);
        }
        return this.studentsService.delete(deleteStudentInput._id);
    }
}
