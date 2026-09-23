import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorDocumentsController } from './incubator-documents.controller';
import { IncubatorDocumentsService } from './incubator-documents.service';

describe('IncubatorDocumentsController', () => {
  let controller: IncubatorDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncubatorDocumentsController],
      providers: [{ provide: IncubatorDocumentsService, useValue: {} }],
    }).compile();

    controller = module.get<IncubatorDocumentsController>(
      IncubatorDocumentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
