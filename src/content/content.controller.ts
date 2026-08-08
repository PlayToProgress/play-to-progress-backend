import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpsertContentDto } from './dto/upsert-content.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get()
  async findAll(@Query('cohortId') cohortId?: string) {
    return { content: await this.contentService.findByCohort(cohortId) };
  }

  @Roles('coordinator')
  @Post()
  async upsert(@Body() dto: UpsertContentDto) {
    return { content: await this.contentService.upsert(dto) };
  }

  @Roles('coordinator')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<UpsertContentDto>,
  ) {
    return { content: await this.contentService.update(id, dto) };
  }

  @Roles('coordinator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
