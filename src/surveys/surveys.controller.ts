import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, SubmitResponseDto } from './dto/survey.dto';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('surveys')
export class SurveysController {
  constructor(private surveysService: SurveysService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return { surveys: await this.surveysService.findScoped(user) };
  }

  @Roles('coordinator')
  @Post()
  async create(@Body() dto: CreateSurveyDto, @CurrentUser() user: AuthUser) {
    return { survey: await this.surveysService.create(dto, user.id) };
  }

  @Post(':id/responses')
  async submitResponse(
    @Param('id') id: string,
    @Body() dto: SubmitResponseDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!['participant', 'parent', 'partner'].includes(user.role)) {
      throw new ForbiddenException('Only respondents can submit answers.');
    }
    return {
      response: await this.surveysService.submitResponse(id, user, dto),
    };
  }

  @Roles('coordinator')
  @Get(':id/responses')
  async getResponses(@Param('id') id: string) {
    return { responses: await this.surveysService.getResponses(id) };
  }
}
