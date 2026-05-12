import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorMembersService } from './incubator-members.service';

describe('IncubatorMembersService', () => {
  let service: IncubatorMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncubatorMembersService],
    }).compile();

    service = module.get<IncubatorMembersService>(IncubatorMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
