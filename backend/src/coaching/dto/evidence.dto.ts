import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { EvidenceReviewStatus, EvidenceType } from '@prisma/client';

export class CreateEvidenceDto {
  @IsEnum(EvidenceType, { message: 'Type de preuve invalide' })
  type: EvidenceType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL invalide' })
  url?: string;
}

export class ReviewEvidenceDto {
  @IsEnum(EvidenceReviewStatus, {
    message: 'Statut de revue invalide (APPROVED ou REJECTED)',
  })
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  comment?: string;
}
