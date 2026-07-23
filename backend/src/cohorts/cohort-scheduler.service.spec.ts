import { Test, TestingModule } from '@nestjs/testing';
import { CohortSchedulerService } from './cohort-scheduler.service';
import { CohortsService } from './cohorts.service';

describe('CohortSchedulerService', () => {
  let scheduler: CohortSchedulerService;
  let cohortsService: { closeCohortsAutomatically: jest.Func };

  beforeEach(async () => {
    cohortsService = { closeCohortsAutomatically: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortSchedulerService,
        { provide: CohortsService, useValue: cohortsService },
      ],
    }).compile();

    scheduler = module.get<CohortSchedulerService>(CohortSchedulerService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  describe('handleAutoClose', () => {
    it('should call closeCohortsAutomatically', async () => {
      (cohortsService.closeCohortsAutomatically as jest.Mock).mockResolvedValue([]);

      await scheduler.handleAutoClose();

      expect(cohortsService.closeCohortsAutomatically).toHaveBeenCalledTimes(1);
    });

    it('should not fail when no cohorts are closed', async () => {
      (cohortsService.closeCohortsAutomatically as jest.Mock).mockResolvedValue([]);

      await scheduler.handleAutoClose();

      expect(cohortsService.closeCohortsAutomatically).toHaveBeenCalled();
    });

    it('should propagate errors from closeCohortsAutomatically', async () => {
      (cohortsService.closeCohortsAutomatically as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(scheduler.handleAutoClose()).rejects.toThrow('DB error');
    });
  });
});
