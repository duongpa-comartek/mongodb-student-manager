import * as DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';
import { ClassesService } from './classes.service';
import { Class } from './schemas/class.schema';

export function createClassesLoaderById(classesService: ClassesService) {
    return new DataLoader<ObjectId, Class>(async (_ids: ObjectId[]) => {
        const classes = _ids.map((_id) => classesService.findOneById(_id));
        return await Promise.all(classes);
    });
}