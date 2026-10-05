/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    getOwnerDashboard: jest.Mock;
    getExpertDashboard: jest.Mock;
    getIncubatorDashboard: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getOwnerDashboard: jest.fn().mockResolvedValue({ role: 'PROJECT_OWNER' }),
      getExpertDashboard: jest.fn().mockResolvedValue({ role: 'EXPERT' }),
      getIncubatorDashboard: jest
        .fn()
        .mockResolvedValue({ role: 'INCUBATOR_MEMBER' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('protects the owner endpoint with the PROJECT_OWNER role', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      DashboardController.prototype.getOwnerDashboard,
    );
    expect(roles).toEqual([UserRole.PROJECT_OWNER]);
  });

  it('protects the expert endpoint with the EXPERT role', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      DashboardController.prototype.getExpertDashboard,
    );
    expect(roles).toEqual([UserRole.EXPERT]);
  });

  it('protects the incubator endpoint with the INCUBATOR_MEMBER role', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      DashboardController.prototype.getIncubatorDashboard,
    );
    expect(roles).toEqual([UserRole.INCUBATOR_MEMBER]);
  });

  it('delegates to the service with the authenticated user id', async () => {
    const req = { user: { id: 'user-1' } };
    await controller.getOwnerDashboard(req);
    expect(service.getOwnerDashboard).toHaveBeenCalledWith('user-1');

    await controller.getExpertDashboard(req);
    expect(service.getExpertDashboard).toHaveBeenCalledWith('user-1');

    await controller.getIncubatorDashboard(req);
    expect(service.getIncubatorDashboard).toHaveBeenCalledWith('user-1');
  });
});
