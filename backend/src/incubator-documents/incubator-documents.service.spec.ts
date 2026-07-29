import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncubatorDocumentsService } from './incubator-documents.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IncubatorDocumentsService', () => {
  let service: IncubatorDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncubatorDocumentsService,
        { provide: PrismaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<IncubatorDocumentsService>(IncubatorDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
