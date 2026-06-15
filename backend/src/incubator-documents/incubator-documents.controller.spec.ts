import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorDocumentsController } from './incubator-documents.controller';

describe('IncubatorDocumentsController', () => {
  let controller: IncubatorDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorDocumentsController],
    }).compile();

    controller = module.get<IncubatorDocumentsController>(IncubatorDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
