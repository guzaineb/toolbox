import { IsString, IsOptional, IsUUID, IsObject, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class ProjectIdParam {
  @IsUUID()
  projectId: string;
}

export class ImpactMeasureDto {
  @IsOptional() @IsObject() kpis_environnementaux?: Record<string, any>;
  @IsOptional() @IsObject() kpis_sociaux?: Record<string, any>;
  @IsOptional() @IsObject() kpis_economiques?: Record<string, any>;
  @IsOptional() @IsString() methode_mesure?: string;
  @IsOptional() @IsString() periode_mesure?: string;
  @IsOptional() @IsObject() objectifs_impact?: Record<string, any>;
  @IsOptional() @IsObject() resultats_actuels?: Record<string, any>;
  @IsOptional() @IsString() rapport_impact?: string;
}

export class UpdateImpactMeasureDto extends PartialType(ImpactMeasureDto) {}
