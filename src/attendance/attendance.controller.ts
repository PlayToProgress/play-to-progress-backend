import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('cohortId') cohortId?: string,
    @Query('sessionNumber') sessionNumber?: string,
    @Query('participantId') participantId?: string,
  ) {
    return {
      attendance: await this.attendanceService.findScoped(user, {
        cohortId,
        sessionNumber: sessionNumber ? Number(sessionNumber) : undefined,
        participantId,
      }),
    };
  }

  @Roles('coordinator')
  @Post()
  async mark(@Body() dto: MarkAttendanceDto, @CurrentUser() user: AuthUser) {
    return { attendance: await this.attendanceService.mark(dto, user.id) };
  }
}
