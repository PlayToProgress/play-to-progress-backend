import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
