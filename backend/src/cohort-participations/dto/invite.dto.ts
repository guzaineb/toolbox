import { IsString } from 'class-validator';

export class InviteDto {
  @IsString()
  projectId: string;
}
