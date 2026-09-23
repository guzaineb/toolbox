import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExpertService } from './expert.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExpertService', () => {
  let service: ExpertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertService,
        { provide: PrismaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<ExpertService>(ExpertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
