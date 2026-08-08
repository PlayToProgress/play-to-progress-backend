import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('checkins')
export class CheckinsController {
  constructor(private checkinsService: CheckinsService) {}

  @Roles('participant')
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateCheckInDto) {
    return { checkIn: await this.checkinsService.create(user.id, dto) };
  }

  @Roles('coordinator')
  @Get()
  async findAll(@Query('flagged') flagged?: string) {
    return { checkIns: await this.checkinsService.findAll(flagged === 'true') };
  }

  @Roles('coordinator')
  @Patch(':id')
  async resolve(@Param('id') id: string) {
    return { checkIn: await this.checkinsService.resolve(id) };
  }
}
