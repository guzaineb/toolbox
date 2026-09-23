import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CohortsService } from './cohorts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CohortStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CohortsService', () => {
  let service: CohortsService;
  let prisma: {
    cohort: {
      findMany: jest.Func;
      findUnique: jest.Func;
      create: jest.Func;
      update: jest.Func;
      updateMany: jest.Func;
    };
    incubatorMember: {
      findUnique: jest.Func;
      findMany: jest.Func;
    };
  };

  beforeEach(async () => {
    const eventEmitter = { emit: jest.fn() };

    prisma = {
      cohort: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      incubatorMember: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<CohortsService>(CohortsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('closeCohortsAutomatically', () => {
    it('should return empty array when no cohorts need closing', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual([]);
      expect(prisma.cohort.updateMany).not.toHaveBeenCalled();
    });

    it('should close cohort when capacity is reached', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cohort-1',
          capacity: 10,
          current_participants: 10,
          application_deadline: new Date(Date.now() + 86400000),
        },
      ]);
      (prisma.cohort.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual(['cohort-1']);
      expect(prisma.cohort.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['cohort-1'] }, status: CohortStatus.OPEN },
        data: { status: CohortStatus.CLOSED },
      });
    });

    it('should close cohort when application deadline has passed', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cohort-2',
          capacity: 20,
          current_participants: 5,
          application_deadline: new Date(Date.now() - 86400000),
        },
      ]);
      (prisma.cohort.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual(['cohort-2']);
    });

    it('should close cohort when capacity reached AND deadline passed', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cohort-3',
          capacity: 5,
          current_participants: 5,
          application_deadline: new Date(Date.now() - 1000),
        },
      ]);
      (prisma.cohort.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual(['cohort-3']);
    });

    it('should NOT close cohort with no capacity set and valid deadline', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cohort-4',
          capacity: null,
          current_participants: 50,
          application_deadline: new Date(Date.now() + 86400000),
        },
      ]);

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual([]);
      expect(prisma.cohort.updateMany).not.toHaveBeenCalled();
    });

    it('should NOT close cohort with no deadline and capacity not reached', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cohort-5',
          capacity: 20,
          current_participants: 10,
          application_deadline: null,
        },
      ]);

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual([]);
      expect(prisma.cohort.updateMany).not.toHaveBeenCalled();
    });

    it('should close multiple eligible cohorts in batch', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cohort-a',
          capacity: 10,
          current_participants: 10,
          application_deadline: null,
        },
        {
          id: 'cohort-b',
          capacity: 20,
          current_participants: 5,
          application_deadline: new Date(Date.now() - 1000),
        },
        {
          id: 'cohort-c',
          capacity: 15,
          current_participants: 3,
          application_deadline: new Date(Date.now() + 86400000),
        },
      ]);
      (prisma.cohort.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await service.closeCohortsAutomatically();

      expect(result).toEqual(['cohort-a', 'cohort-b']);
      expect(prisma.cohort.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['cohort-a', 'cohort-b'] },
          status: CohortStatus.OPEN,
        },
        data: { status: CohortStatus.CLOSED },
      });
    });

    it('should only query OPEN cohorts', async () => {
      (prisma.cohort.findMany as jest.Mock).mockResolvedValue([]);

      await service.closeCohortsAutomatically();

      expect(prisma.cohort.findMany).toHaveBeenCalledWith({
        where: { status: CohortStatus.OPEN },
        select: {
          id: true,
          capacity: true,
          current_participants: true,
          application_deadline: true,
        },
      });
    });
  });

  describe('changeStatus', () => {
    beforeEach(() => {
      (prisma.incubatorMember.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'user-1',
        incubator_id: 'inc-1',
        role: 'ADMIN',
        can_manage_cohorts: true,
      });
    });

    it('should allow OPEN -> CLOSED transition', async () => {
      (prisma.cohort.findUnique as jest.Mock).mockResolvedValue({
        id: 'cohort-1',
        status: CohortStatus.OPEN,
        incubator_id: 'inc-1',
        capacity: 10,
        current_participants: 5,
      });
      (prisma.cohort.update as jest.Mock).mockResolvedValue({
        id: 'cohort-1',
        status: CohortStatus.CLOSED,
      });

      const result = await service.changeStatus(
        'cohort-1',
        CohortStatus.CLOSED,
        'user-1',
      );

      expect(result.status).toBe(CohortStatus.CLOSED);
    });

    it('should reject DRAFT -> CLOSED transition', async () => {
      (prisma.cohort.findUnique as jest.Mock).mockResolvedValue({
        id: 'cohort-1',
        status: CohortStatus.DRAFT,
        incubator_id: 'inc-1',
        capacity: 10,
        current_participants: 0,
      });

      await expect(
        service.changeStatus('cohort-1', CohortStatus.CLOSED, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ARCHIVED -> CLOSED transition', async () => {
      (prisma.cohort.findUnique as jest.Mock).mockResolvedValue({
        id: 'cohort-1',
        status: CohortStatus.ARCHIVED,
        incubator_id: 'inc-1',
        capacity: 10,
        current_participants: 0,
      });

      await expect(
        service.changeStatus('cohort-1', CohortStatus.CLOSED, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for unknown cohort', async () => {
      (prisma.cohort.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.changeStatus('unknown', CohortStatus.CLOSED, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
