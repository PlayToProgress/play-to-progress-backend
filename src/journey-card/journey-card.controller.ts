import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { JourneyCardService } from './journey-card.service';
import { IssueRewardDto } from './dto/issue-reward.dto';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('journey-card')
export class JourneyCardController {
  constructor(private journeyCardService: JourneyCardService) {}

  @Get()
  async find(
    @CurrentUser() user: AuthUser,
    @Query('participantId') participantId?: string,
    @Query('completed') completed?: string,
  ) {
    if (user.role === 'participant') {
      return { card: await this.journeyCardService.findMine(user.id) };
    }
    return {
      cards: await this.journeyCardService.findScoped(
        user,
        participantId,
        completed === 'true',
      ),
    };
  }

  @Roles('coordinator')
  @Post('reward')
  async issueReward(
    @Body() dto: IssueRewardDto,
    @CurrentUser() user: AuthUser,
  ) {
    return {
      card: await this.journeyCardService.issueReward(
        dto.participantId,
        user.id,
      ),
    };
  }
}
