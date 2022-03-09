import { forwardRef, Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { ClassesModule } from 'src/classes/classes.module';
import { StudentsModule } from 'src/students/students.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Score, ScoreSchema } from './schemas/score.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Score.name, schema: ScoreSchema }]),
    forwardRef(() => StudentsModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => ClassesModule),
  ],
  controllers: [ScoresController],
  providers: [ScoresService],
  exports: [ScoresService]
})
export class ScoresModule { }
