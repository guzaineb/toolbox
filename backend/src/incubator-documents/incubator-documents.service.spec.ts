import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncubatorDocumentsService } from './incubator-documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { ModuleAccessService } from '../common/services/module-access.service';

describe('IncubatorDocumentsService', () => {
  let service: IncubatorDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncubatorDocumentsService,
        { provide: PrismaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: NotificationMessageBuilder, useValue: { build: jest.fn() } },
        {
          provide: ModuleAccessService,
          useValue: {
            assertCanManageCohorts: jest.fn(),
            assertIncubatorAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IncubatorDocumentsService>(IncubatorDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
