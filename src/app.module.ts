import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from './students/students.module';
import { ScoresModule } from './scores/scores.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { StudentsService } from './students/students.service';
import { ClassesService } from './classes/classes.service';
import { SubjectsService } from './subjects/subjects.service';
import { ScoresService } from './scores/scores.service';
import { createStudentsLoaderByClass, createStudentsLoaderById } from './students/students.loader';
import { createClassesLoaderById } from './classes/classes.loader';
import { createScoresLoaderByStudent, createScoresLoaderBySubject } from './scores/scores.loader';
import { createSubjectsLoaderById } from './subjects/subjects.loader';

@Module({
  imports: [
    StudentsModule,
    ScoresModule,
    ClassesModule,
    SubjectsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/student-manager'),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ClassesModule, StudentsModule, SubjectsModule, ScoresModule],
      inject: [ClassesService, StudentsService, SubjectsService, ScoresService],
      useFactory: (
        classesService: ClassesService,
        studentsService: StudentsService,
        subjectsService: SubjectsService,
        scoresService: ScoresService
      ) => ({
        debug: true,
        sortSchema: true,
        installSubscriptionHandlers: true,
        autoSchemaFile: 'schema.gql',
        context: () => ({
          studentsLoaderByClass: createStudentsLoaderByClass(studentsService),
          classesLoaderById: createClassesLoaderById(classesService),
          scoresLoaderByStudent: createScoresLoaderByStudent(scoresService),
          studentsLoaderById: createStudentsLoaderById(studentsService),
          subjectsLoaderById: createSubjectsLoaderById(subjectsService),
          scoresLoaderBySubject: createScoresLoaderBySubject(scoresService)
        }),
      })
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

