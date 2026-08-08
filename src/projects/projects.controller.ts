import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('participantId') participantId?: string,
  ) {
    return {
      projects: await this.projectsService.findScoped(user, participantId),
    };
  }

  @Roles('participant')
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return { project: await this.projectsService.create(user, dto) };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return { project: await this.projectsService.update(user, id, dto) };
  }
}
