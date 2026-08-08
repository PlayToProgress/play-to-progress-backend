import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('participants')
export class ParticipantsController {
  constructor(private participantsService: ParticipantsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('cohortId') cohortId?: string,
  ) {
    return {
      participants: await this.participantsService.findScoped(user, cohortId),
    };
  }

  @Roles('participant')
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return { participant: await this.participantsService.findMe(user.id) };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return {
      participant: await this.participantsService.findOneScoped(user, id),
    };
  }

  @Roles('coordinator')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateParticipantDto) {
    return { participant: await this.participantsService.update(id, dto) };
  }
}
