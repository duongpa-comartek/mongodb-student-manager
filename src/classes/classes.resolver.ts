import { Resolver, Query, ResolveField, Args, ID, Parent, Mutation, Context } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ClassesService } from './classes.service';
import { Class } from './schemas/class.schema';
import { StudentsService } from 'src/students/students.service';
import { Student, StudentResult } from 'src/students/schemas/student.schema';
import { CreateClassInput, UpdateClassInput, FindClassArgs, DeleteClassInput } from './input/index';
import { HttpException, HttpStatus } from '@nestjs/common';
import DataLoader from 'dataloader';

@Resolver(() => Class)
export class ClassesResolver {
    constructor(
        private readonly classesService: ClassesService,
        private readonly studentsService: StudentsService
    ) { }

    @Query(() => [Class])
    async classes() {
        return this.classesService.findAll();
    }

    @ResolveField('students', () => [Student])
    async getStudents(
        @Parent() parent: Class,
        @Context() {
            studentsLoaderByClass
        }: { studentsLoaderByClass: DataLoader<ObjectId, StudentResult> }
    ) {
        return (await studentsLoaderByClass.load(parent._id)).result;
    }

    @Query(() => [Class])
    async searchClass(@Args() searchClass: FindClassArgs) {
        return this.classesService.search(searchClass);
    }

    @Mutation(() => Class)
    async addClass(@Args('createClassInput') createClassInput: CreateClassInput) {
        return this.classesService.create(createClassInput);
    }

    @Mutation(() => Class)
    async updateClass(@Args('updateClassInput') updateClassInput: UpdateClassInput) {
        const { _id, ...update } = updateClassInput;
        return this.classesService.update(_id, update);
    }

    @Mutation(() => Class)
    async deleteClass(@Args('deleteClassInput') { _id }: DeleteClassInput) {
        //Kiểm tra class có student ko?
        const student = await this.studentsService.checkExist({ class: _id });
        if (student) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST, error: `Bad Request: Class has students!`,
            }, HttpStatus.BAD_REQUEST);
        }
        return this.classesService.delete(_id);
    }
}
