import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FundingService } from './funding.service';
import { ProjectIdParam, SubmitQuestionnaireDto } from './dto/funding.dto';

@Controller('projects/:projectId/funding')
@UseGuards(JwtAuthGuard)
export class FundingController {
  constructor(private readonly funding: FundingService) {}

  @Get('questions')
  getQuestions() {
    return this.funding.getQuestions();
  }

  @Get()
  getAssessment(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.funding.getAssessment(params.projectId, req.user.id);
  }

  @Post('questionnaire')
  submitQuestionnaire(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.funding.submitQuestionnaire(
      params.projectId,
      dto.reponses,
      req.user.id,
    );
  }

  @Patch()
  updateAssessment(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.funding.updateAssessment(params.projectId, data, req.user.id);
  }
}
