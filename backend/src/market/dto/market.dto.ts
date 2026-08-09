import { IsString, IsOptional, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectIdParam } from '../../common/dto/project-id.param';

export { ProjectIdParam };

export class MarketAccessDto {
  @IsOptional() @IsString() essence_marque?: string;
  @IsOptional() @IsString() alignement_objectifs?: string;
  @IsOptional() @IsString() positionnement?: string;
  @IsOptional() @IsString() identite_visuelle?: string;
  @IsOptional() @IsString() narration?: string;
  @IsOptional() @IsObject() messages_cles?: Record<string, any>;
  @IsOptional() @IsObject() canaux_marketing?: Record<string, any>;
  @IsOptional() @IsObject() partenariats_market?: Record<string, any>;
}

export class UpdateMarketAccessDto extends PartialType(MarketAccessDto) {}
