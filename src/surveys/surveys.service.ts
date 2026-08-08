import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoDesignSurvey } from '../schemas/co-design-survey.schema';
import { SurveyResponse } from '../schemas/survey-response.schema';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateSurveyDto, SubmitResponseDto } from './dto/survey.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectModel(CoDesignSurvey.name)
    private surveyModel: Model<CoDesignSurvey>,
    @InjectModel(SurveyResponse.name)
    private responseModel: Model<SurveyResponse>,
  ) {}

  findScoped(user: AuthUser) {
    const filter: Record<string, unknown> = {};
    if (user.role !== 'coordinator' && user.role !== 'admin') {
      filter.published = true;
      filter.targetAudience = user.role;
    }
    return this.surveyModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  create(dto: CreateSurveyDto, createdBy: string) {
    return this.surveyModel.create({ ...dto, createdBy });
  }

  submitResponse(surveyId: string, user: AuthUser, dto: SubmitResponseDto) {
    return this.responseModel.findOneAndUpdate(
      { surveyId, respondentUserId: user.id },
      {
        surveyId,
        respondentUserId: user.id,
        respondentRole: user.role,
        answers: dto.answers,
      },
      { new: true, upsert: true },
    );
  }

  getResponses(surveyId: string) {
    return this.responseModel.find({ surveyId }).lean();
  }
}
