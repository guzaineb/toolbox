import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { JurySessionStatus } from '@prisma/client';

export class UpdateJurySessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsEnum(JurySessionStatus, {
    message: 'Statut invalide (DRAFT, OPEN, DELIBERATION ou CLOSED)',
  })
  status?: JurySessionStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberUserIds?: string[];

  @IsOptional()
  reevaluation_requested?: boolean;
}
