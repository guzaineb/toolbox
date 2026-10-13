import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { ProjectsService } from './projects.service';

type FindManyArgs = {
  where: Record<string, unknown>;
  skip: number;
  take: number;
};

type OwnerArgs = {
  where: { id: { in: string[] } };
};

async function buildService(prisma: unknown): Promise<ProjectsService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ProjectsService,
      { provide: PrismaService, useValue: prisma },
      { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      { provide: NotificationMessageBuilder, useValue: {} },
    ],
  }).compile();

  return module.get<ProjectsService>(ProjectsService);
}

describe('ProjectsService', () => {
  describe('findDirectory', () => {
    it('joint le nom du porteur et pagine les projets', async () => {
      let findArgs: FindManyArgs | undefined;
      let ownerArgs: OwnerArgs | undefined;

      const prisma = {
        $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
        project: {
          findMany: jest.fn((args: FindManyArgs) => {
            findArgs = args;
            return Promise.resolve([
              { id: 'project-1', name: 'Ferme urbaine', owner_id: 'owner-1' },
              { id: 'project-2', name: 'Projet anonyme', owner_id: 'owner-2' },
            ]);
          }),
          count: jest.fn(() => Promise.resolve(2)),
        },
        user: {
          findMany: jest.fn((args: OwnerArgs) => {
            ownerArgs = args;
            return Promise.resolve([
              {
                id: 'owner-1',
                profile: { first_name: 'Awa', last_name: 'Diallo' },
              },
            ]);
          }),
        },
      };

      const result = await (
        await buildService(prisma)
      ).findDirectory({
        q: '  ferme ',
        page: 2,
        limit: 8,
      });

      expect(findArgs?.skip).toBe(8);
      expect(findArgs?.take).toBe(8);
      expect(JSON.stringify(findArgs?.where.OR)).toContain('ferme');
      expect(ownerArgs?.where.id.in).toEqual(['owner-1', 'owner-2']);
      expect(result.items[0]).toEqual({
        id: 'project-1',
        name: 'Ferme urbaine',
        owner_id: 'owner-1',
        ownerName: 'Awa Diallo',
      });
      // Porteur sans profil utilisable → libellé générique
      expect(result.items[1].ownerName).toBe('Porteur de projet');
      expect(result).toMatchObject({ total: 2, page: 2, limit: 8 });
    });

    it('ne requête aucun porteur quand la page est vide', async () => {
      const userFindMany = jest.fn();

      const prisma = {
        $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
        project: {
          findMany: jest.fn(() => Promise.resolve([])),
          count: jest.fn(() => Promise.resolve(0)),
        },
        user: { findMany: userFindMany },
      };

      const result = await (await buildService(prisma)).findDirectory();

      expect(result).toEqual({ items: [], total: 0, page: 1, limit: 12 });
      expect(userFindMany).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('renvoie un tableau vide pour une requête vide', async () => {
      const findMany = jest.fn();

      await expect(
        (await buildService({ project: { findMany } })).search('  '),
      ).resolves.toEqual([]);
      expect(findMany).not.toHaveBeenCalled();
    });
  });
});
