import { MiddlewareConsumer, Module, NestModule, Next, RequestMethod } from '@nestjs/common';
import { PassportModule, PassportSerializer, PassportStrategy } from '@nestjs/passport';
import { BullboardController } from './bullboard.controller';
import { BullboardService } from './bullboard.service';
import { LoginStrategy } from './login.strategy';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import * as Queue from 'bull';
import * as passport from 'passport';

@Module({
  imports: [
    PassportModule,
  ],
  controllers: [BullboardController],
  providers: [LoginStrategy, BullboardService]
})

export class BullboardModule implements NestModule {
  private serverAdaper: ExpressAdapter;
  private bullAdapter: BullAdapter;

  constructor() {
    this.serverAdaper = new ExpressAdapter();
    this.serverAdaper.setBasePath('queue');
    const queue = new Queue('mail-queue');
    this.bullAdapter = new BullAdapter(queue);

    createBullBoard({
      queues: [this.bullAdapter],
      serverAdapter: this.serverAdaper
    });
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        passport.authenticate('login', { session: false }),
        this.serverAdaper.getRouter()
      )
      .forRoutes('queue');
  }
}
