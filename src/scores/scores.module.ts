import { forwardRef, Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { ClassesModule } from 'src/classes/classes.module';
import { StudentsModule } from 'src/students/students.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Score, ScoreSchema } from './schemas/score.schema';
import { ScoresResolver } from './scores.resolver';
import { Student, StudentSchema } from 'src/students/schemas/student.schema';
import { Subject, SubjectSchema } from 'src/subjects/schemas/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Score.name, schema: ScoreSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
    forwardRef(() => StudentsModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => ClassesModule),
  ],
  controllers: [ScoresController],
  providers: [ScoresService, ScoresResolver],
  exports: [ScoresService]
})
export class ScoresModule { }
