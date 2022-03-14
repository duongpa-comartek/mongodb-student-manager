import * as DataLoader from 'dataloader';
import { StudentsService } from "./students.service";
import { Student, StudentResult } from "./schemas/student.schema";
import { ObjectId } from 'mongoose';

export function createStudentsLoaderById(studentsService: StudentsService) {
    return new DataLoader<ObjectId, Student>(async (_ids: ObjectId[]) => {
        const students = _ids.map((_id) => studentsService.findOneById(_id));
        return Promise.all(students);
    });
}

export function createStudentsLoaderByClass(studentsService: StudentsService) {
    return new DataLoader<ObjectId, StudentResult>(async (_ids: ObjectId[]) => {
        const students = _ids.map((_id) => studentsService.getStudentsInClassByIds(_id));
        return await Promise.all(students);
    });
}