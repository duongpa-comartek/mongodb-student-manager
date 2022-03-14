import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Score } from 'src/scores/schemas/score.schema';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { Subject, SubjectDocument } from './schemas/subject.schema';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>
    ) { }

    async findAll(): Promise<Subject[]> {
        return await this.subjectModel.find().exec();
    }

    async findOneById(id: string | ObjectId) {
        return await this.subjectModel.findById(id).exec();
    }

    async create(create: CreateSubjectDto): Promise<Subject> {
        return await new this.subjectModel(create).save();
    }

    async update(id: string | ObjectId, update: UpdateSubjectDto): Promise<Subject> {
        return await this.subjectModel.findByIdAndUpdate(id, update).exec();
    }

    async updatePushOneScore(id: string, score: Score) {
        return await this.subjectModel.findByIdAndUpdate(id, {
            $push: { scores: score }
        })
    }

    async updateDeleteOneScore(id: string, scoreId: string) {
        return await this.subjectModel.findByIdAndUpdate(id, {
            $pullAll: {
                scores: [{ _id: scoreId }]
            }
        });
    }

    async delete(id: string | ObjectId): Promise<Subject> {
        return await this.subjectModel.findByIdAndDelete(id).exec();
    }
}
