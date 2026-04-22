import {Controller,Post,Body,Get,Patch,Delete,Param,UseGuards,
  Req,HttpCode,HttpStatus,ParseUUIDPipe,NotFoundException,} from '@nestjs/common';
import { ExpertService } from './expert.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { AddExpertiseDto } from './dto/add-expertise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('experts')
@UseGuards(JwtAuthGuard)
export class ExpertController {
  constructor(private service: ExpertService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateExpertDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('me')
  findMine(@Req() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  @Patch('me')
  update(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateExpertDto,
  ) {
    return this.service.upsert(req.user.id, dto);
  }

  // ── Domaines d'expertise ───────────────────────────────────────────────────

  /**
   * GET /experts/expertise-areas
   * Lister tous les domaines disponibles (pour le formulaire)
   */
  @Get('expertise-areas')
  getAllAreas() {
    return this.service.getAllAreas();
  }

  /**
   * POST /experts/expertise
   * Ajouter un domaine d'expertise à mon profil
   */
  @Post('expertise')
  @HttpCode(HttpStatus.CREATED)
  addExpertise(
    @Req() req: { user: { id: string } },
    @Body() dto: AddExpertiseDto,
  ) {
    return this.service.addExpertise(req.user.id, dto);
  }

  /**
   * DELETE /experts/expertise/:expertiseAreaId
   * Supprimer un domaine d'expertise de mon profil
   */
  @Delete('expertise/:expertiseAreaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExpertise(
    @Req() req: { user: { id: string } },
    @Param('expertiseAreaId', ParseUUIDPipe) expertiseAreaId: string,
  ) {
    return this.service.removeExpertise(req.user.id, expertiseAreaId);
  }

  // ── Consultation publique ──────────────────────────────────────────────────

  /**
   * GET /experts
   * Lister tous les experts (avec filtres possibles via query params à venir)
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * GET /experts/:id
   * Voir le profil public d'un expert
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
}