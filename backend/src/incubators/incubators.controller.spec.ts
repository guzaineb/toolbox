import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncubatorsController } from './incubators.controller';
import { IncubatorsService } from './incubators.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IncubatorsController', () => {
  let controller: IncubatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorsController],
      providers: [
        IncubatorsService,
        { provide: PrismaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    controller = module.get<IncubatorsController>(IncubatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
