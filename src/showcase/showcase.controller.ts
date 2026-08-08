import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShowcaseService } from './showcase.service';
import {
  CreateShowcaseEventDto,
  UpdateShowcaseEventDto,
} from './dto/showcase-event.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';

@Controller('showcase')
export class ShowcaseController {
  constructor(private showcaseService: ShowcaseService) {}

  @Public()
  @Get()
  getPublicGallery() {
    return this.showcaseService.getPublicGallery();
  }

  @Roles('coordinator')
  @Get('events')
  async findAllEvents() {
    return { events: await this.showcaseService.findAllEvents() };
  }

  @Roles('coordinator')
  @Post('events')
  async createEvent(
    @Body() dto: CreateShowcaseEventDto,
    @CurrentUser() user: AuthUser,
  ) {
    return { event: await this.showcaseService.createEvent(dto, user.id) };
  }

  @Roles('coordinator')
  @Patch('events/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() dto: UpdateShowcaseEventDto,
  ) {
    return { event: await this.showcaseService.updateEvent(id, dto) };
  }
}
