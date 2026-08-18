import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CohortExpertRole } from '@prisma/client';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty({ message: "L'identifiant de l'expert est requis" })
  expertUserId: string;

  @IsEnum(CohortExpertRole, {
    message: 'Rôle invalide (COACH ou JURY)',
  })
  role: CohortExpertRole;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
