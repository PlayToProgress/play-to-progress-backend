import { Module } from '@nestjs/common';
import { JourneyCardService } from './journey-card.service';
import { JourneyCardController } from './journey-card.controller';

@Module({
  providers: [JourneyCardService],
  controllers: [JourneyCardController],
})
export class JourneyCardModule {}
