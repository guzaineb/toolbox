import { Test, TestingModule } from '@nestjs/testing';
import { ProjectOwnerService } from './project-owner.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectOwnerService', () => {
  let service: ProjectOwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectOwnerService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ProjectOwnerService>(ProjectOwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
