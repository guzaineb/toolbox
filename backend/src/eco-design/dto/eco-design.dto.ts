import { IsString, IsOptional, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectIdParam } from '../../common/dto/project-id.param';

export { ProjectIdParam };

export class EcoDesignDto {
  @IsOptional() @IsString() equipe_eco?: string;
  @IsOptional() @IsString() projet_eco?: string;
  @IsOptional() @IsString() contexte_eco?: string;
  @IsOptional() @IsString() vision_durable?: string;
  @IsOptional() @IsObject() cycle_de_vie?: Record<string, any>;
  @IsOptional() @IsString() performance_eco?: string;
  @IsOptional() @IsObject() strategies_eco?: Record<string, any>;
  @IsOptional() @IsObject() plan_action_eco?: Record<string, any>;
}

export class UpdateEcoDesignDto extends PartialType(EcoDesignDto) {}
