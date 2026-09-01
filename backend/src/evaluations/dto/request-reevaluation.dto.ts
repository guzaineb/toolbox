import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class RequestReevaluationDto {
  /** Restreindre la ré-évaluation à certains jurys ; sinon tous les jurys affectés. */
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  juryUserIds?: string[];
}
