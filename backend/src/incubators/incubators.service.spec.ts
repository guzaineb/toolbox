import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncubatorsService } from './incubators.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { ModuleAccessService } from '../common/services/module-access.service';

describe('IncubatorsService', () => {
  let service: IncubatorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncubatorsService,
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

    service = module.get<IncubatorsService>(IncubatorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
