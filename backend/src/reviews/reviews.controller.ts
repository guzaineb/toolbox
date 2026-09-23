import { Controller, Post, Get, Param, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('projects/:projectId/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(projectId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findByProject(@Param('projectId') projectId: string) {
    return this.reviewsService.findByProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('score')
  getAverageScore(@Param('projectId') projectId: string) {
    return this.reviewsService.getAverageScore(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('step/:stepId')
  findByStep(@Param('projectId') projectId: string, @Param('stepId') stepId: string) {
    return this.reviewsService.findByStep(projectId, stepId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
