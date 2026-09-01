import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('projects/:projectId/assignments')
  @HttpCode(HttpStatus.CREATED)
  assign(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAssignmentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.assignmentsService.assign(projectId, dto, req.user.id);
  }

  @Get('projects/:projectId/assignments')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.assignmentsService.findByProject(projectId, req.user.id);
  }

  @Get('assignments/:id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.assignmentsService.findOne(id, req.user.id);
  }

  @Patch('assignments/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.assignmentsService.update(id, dto, req.user.id);
  }

  @Delete('assignments/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.assignmentsService.remove(id, req.user.id);
  }

  @Get('experts/me/assignments')
  findMy(@Req() req: { user: { id: string } }) {
    return this.assignmentsService.findMyAssignments(req.user.id);
  }
}
