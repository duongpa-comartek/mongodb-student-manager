import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Score, ScoreResult } from 'src/scores/schemas/score.schema';
import { ScoresService } from 'src/scores/scores.service';
import { Subject } from './schemas/subject.schema';
import { SubjectsService } from './subjects.service';
import { CreateSubjectInput, UpdateSubjectInput, DeleteSubjectInput, FindSubjectInput } from './input/index';
import { HttpException, HttpStatus } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';

@Resolver(of => Subject)
export class SubjectsResolver {
    constructor(
        private readonly subjectsService: SubjectsService,
        private readonly scoresService: ScoresService
    ) { }

    @Query(() => [Subject])
    async subjects() {
        return this.subjectsService.findAll();
    }

    @ResolveField('scores', returns => [Score])
    async getScores(
        @Parent() parent: Subject,
        @Context() { scoresLoaderBySubject }: { scoresLoaderBySubject: DataLoader<ObjectId, ScoreResult> }
    ) {
        return (await scoresLoaderBySubject.load(parent._id)).result;
    }

    @Query(() => Subject)
    async subject(@Args('findSubjectInput') { _id }: FindSubjectInput) {
        return this.subjectsService.findOneById(_id);
    }

    @Mutation(() => Subject)
    async addSubject(@Args('createSubjectInput') createSubjectInput: CreateSubjectInput) {
        return this.subjectsService.create(createSubjectInput);
    }

    @Mutation(() => Subject)
    async updateSubject(@Args('updateSubjectInput') updateSubjectInput: UpdateSubjectInput) {
        const { _id, ...update } = updateSubjectInput
        return this.subjectsService.update(_id, update);
    }

    @Mutation(() => Subject)
    async deleteSubject(@Args('deleteSubjectInput') { _id }: DeleteSubjectInput) {
        const score = await this.scoresService.checkExist({ subject: _id });
        if (score) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST, error: `Bad Request: Subject has scores!`,
            }, HttpStatus.BAD_REQUEST);
        }
        return this.subjectsService.delete(_id);
    }
}
