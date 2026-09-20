import { IsUUID } from 'class-validator';

export class ProjectIdParam {
  @IsUUID()
  projectId: string;
}
