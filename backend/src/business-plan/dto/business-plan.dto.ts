import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectIdParam } from '../../common/dto/project-id.param';

export { ProjectIdParam };

export class ManagementPlanDto {
  @IsOptional() @IsString() problemes_gestion?: string;
  @IsOptional() @IsString() ressources_humaines?: string;
  @IsOptional() @IsString() actifs_physiques?: string;
  @IsOptional() @IsString() ressources_intellectuelles?: string;
  @IsOptional() @IsString() production_fournisseurs?: string;
}

export class MarketingPlanDto {
  @IsOptional() @IsString() clients_valeur?: string;
  @IsOptional() @IsString() analyse_marche?: string;
  @IsOptional() @IsString() concurrents?: string;
  @IsOptional() @IsString() offre_prix?: string;
  @IsOptional() @IsString() branding_positionnement?: string;
  @IsOptional() @IsString() canaux_communication?: string;
  @IsOptional() @IsString() relation_client?: string;
}

export class FinancialPlanDto {
  @IsOptional() @IsString() point_depart?: string;
  @IsOptional() @IsNumber() couts_configuration?: number;
  @IsOptional() @IsNumber() capital?: number;
  @IsOptional() @IsObject() compte_resultat?: Record<string, any>;
  @IsOptional() @IsObject() cash_flow?: Record<string, any>;
  @IsOptional() @IsObject() bilan?: Record<string, any>;
  @IsOptional() @IsNumber() seuil_rentabilite?: number;
  @IsOptional() @IsObject() revenus_3ans?: Record<string, any>;
  @IsOptional() @IsString() autres_mesures?: string;
  @IsOptional() @IsString() rapport_financier?: string;
}

export class LegalPlanDto {
  @IsOptional() @IsString() statut_juridique?: string;
  @IsOptional() @IsString() immatriculation?: string;
  @IsOptional() @IsString() contrats?: string;
  @IsOptional() @IsString() assurances?: string;
}

export class KpiDto {
  @IsOptional() @IsObject() kpis?: Record<string, any>;
  @IsOptional() @IsString() objectifs_mesure?: string;
  @IsOptional() @IsString() revues_performance?: string;
}

export class ExecutiveSummaryDto {
  @IsOptional() @IsString() resume_executif?: string;
  @IsOptional() @IsBoolean() generated_by_ai?: boolean;
}

export class UpdateManagementPlanDto extends PartialType(ManagementPlanDto) {}
export class UpdateMarketingPlanDto extends PartialType(MarketingPlanDto) {}
export class UpdateFinancialPlanDto extends PartialType(FinancialPlanDto) {}
export class UpdateLegalPlanDto extends PartialType(LegalPlanDto) {}
export class UpdateKpiDto extends PartialType(KpiDto) {}
export class UpdateExecutiveSummaryDto extends PartialType(
  ExecutiveSummaryDto,
) {}
