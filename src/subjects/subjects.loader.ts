import * as DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';
import { Subject } from './schemas/subject.schema';
import { SubjectsService } from './subjects.service';

export function createSubjectsLoaderById(subjectsService: SubjectsService) {
    return new DataLoader<ObjectId, Subject>(async (_ids: ObjectId[]) => {
        const scores = _ids.map((_id) => subjectsService.findOneById(_id));
        return await Promise.all(scores);
    });
}