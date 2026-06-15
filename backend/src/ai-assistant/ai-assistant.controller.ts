import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private aiService: AiAssistantService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat/:projectId/:stepNumber')
  async chat(
    @Param('projectId') projectId: string,
    @Param('stepNumber') stepNumber: string,
    @Body('message') message: string,
    @Body('context') context: any,
  ) {
    return this.aiService.chat(projectId, +stepNumber, message, context);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-bmc/:projectId')
  async generateBMC(
    @Param('projectId') projectId: string,
    @Body('stepContent') stepContent: any,
  ) {
    return this.aiService.generateBusinessModelCanvas(projectId, stepContent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-business-plan/:projectId')
  async generateBusinessPlan(
    @Param('projectId') projectId: string,
    @Body('allSteps') allSteps: any[],
  ) {
    return this.aiService.generateBusinessPlan(projectId, allSteps);
  }

  @UseGuards(JwtAuthGuard)
  @Post('evaluate/:projectId')
  async evaluate(
    @Param('projectId') projectId: string,
    @Body('allSteps') allSteps: any[],
  ) {
    return this.aiService.evaluateProject(projectId, allSteps);
  }
}
