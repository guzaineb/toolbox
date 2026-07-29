import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncubatorsService } from './incubators.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IncubatorsService', () => {
  let service: IncubatorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncubatorsService,
        { provide: PrismaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<IncubatorsService>(IncubatorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
