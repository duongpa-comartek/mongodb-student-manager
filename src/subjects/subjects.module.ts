import { forwardRef, Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { ScoresModule } from 'src/scores/scores.module';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    forwardRef(() => ScoresModule),
    MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService]
})

export class SubjectsModule { }
