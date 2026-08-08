import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BadgesService } from './badges.service';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AwardBadgeDto } from './dto/award-badge.dto';
import { RECOGNITION_BADGES } from './recognition-badges';

@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('participantId') participantId?: string,
  ) {
    return { badges: await this.badgesService.findScoped(user, participantId) };
  }


  @Get('recognition-catalog')
  getRecognitionCatalog() {
    return { badges: RECOGNITION_BADGES };
  }

  @Roles('coordinator')
  @Post('award')
  async award(@Body() dto: AwardBadgeDto) {
    return { badge: await this.badgesService.award(dto) };
  }
}