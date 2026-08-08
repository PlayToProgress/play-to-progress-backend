import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto, UpdateCohortDto } from './dto/cohort.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('cohorts')
export class CohortsController {
  constructor(private cohortsService: CohortsService) {}

  // Any authenticated role can list/view cohorts (coordinator, partner, parent, participant).
  @Get()
  async findAll() {
    return { cohorts: await this.cohortsService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { cohort: await this.cohortsService.findOne(id) };
  }

  @Roles('coordinator')
  @Post()
  async create(@Body() dto: CreateCohortDto) {
    return { cohort: await this.cohortsService.create(dto) };
  }

  @Roles('coordinator')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCohortDto) {
    return { cohort: await this.cohortsService.update(id, dto) };
  }

  @Roles('coordinator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cohortsService.remove(id);
  }
}
