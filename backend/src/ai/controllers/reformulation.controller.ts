import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReformulationService } from '../reformulation.service';
import { ReformulateStepDto, ReformulateTextDto } from '../dto/reformulation.dto';

@Controller('ai/reformulation')
@UseGuards(JwtAuthGuard)
export class ReformulationController {
  constructor(private readonly reformulation: ReformulationService) {}

  @Post('step')
  async reformulateStep(@Body() dto: ReformulateStepDto) {
    try {
      const result = await this.reformulation.reformulateStep(
        dto.projectId,
        dto.stepKey,
        dto.audience,
      );
      return { success: true, data: result };
    } catch (error) {
      const status = error.message.includes('pas trouvée')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message: error.message }, status);
    }
  }

  @Post('text')
  async reformulateText(@Body() dto: ReformulateTextDto) {
    try {
      const result = await this.reformulation.reformulateText(
        dto.text,
        dto.stepConcept,
        dto.audience,
      );
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
