import { IsString } from 'class-validator';

export class ApplyDto {
  @IsString()
  projectId: string;
}
