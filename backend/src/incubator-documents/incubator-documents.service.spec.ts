import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorDocumentsService } from './incubator-documents.service';

describe('IncubatorDocumentsService', () => {
  let service: IncubatorDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncubatorDocumentsService],
    }).compile();

    service = module.get<IncubatorDocumentsService>(IncubatorDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
