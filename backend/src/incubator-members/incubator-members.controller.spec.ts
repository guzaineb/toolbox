import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorMembersController } from './incubator-members.controller';
import { IncubatorMembersService } from './incubator-members.service';

describe('IncubatorMembersController', () => {
  let controller: IncubatorMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorMembersController],
      providers: [{ provide: IncubatorMembersService, useValue: {} }],
    }).compile();

    controller = module.get<IncubatorMembersController>(
      IncubatorMembersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
