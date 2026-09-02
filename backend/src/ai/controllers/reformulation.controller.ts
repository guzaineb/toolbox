import { Controller, Post, Body, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ReformulationService } from '../reformulation.service';
import { ReformulateStepDto, ReformulateTextDto } from '../dto/reformulation.dto';

type RequestUser = { user: { id: string } };

@Controller('ai/reformulation')
@UseGuards(JwtAuthGuard)
export class ReformulationController {
  constructor(
    private readonly reformulation: ReformulationService,
    private readonly access: ModuleAccessService,
  ) {}

  @Post('step')
  async reformulateStep(@Body() dto: ReformulateStepDto, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);
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
  async reformulateText(@Body() dto: ReformulateTextDto, @Req() _req: RequestUser) {
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
