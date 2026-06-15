import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorsController } from './incubators.controller';

describe('IncubatorsController', () => {
  let controller: IncubatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorsController],
    }).compile();

    controller = module.get<IncubatorsController>(IncubatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
