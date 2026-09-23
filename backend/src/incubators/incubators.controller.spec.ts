import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncubatorsController } from './incubators.controller';
import { IncubatorsService } from './incubators.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

describe('IncubatorsController', () => {
  let controller: IncubatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorsController],
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

    controller = module.get<IncubatorsController>(IncubatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
