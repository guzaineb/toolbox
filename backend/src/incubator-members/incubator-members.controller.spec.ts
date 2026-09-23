import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorMembersController } from './incubator-members.controller';

describe('IncubatorMembersController', () => {
  let controller: IncubatorMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorMembersController],
    }).compile();

    controller = module.get<IncubatorMembersController>(IncubatorMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
