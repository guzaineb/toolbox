import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExpertService } from './expert.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

type FindManyArgs = {
  where: Record<string, unknown>;
  skip: number;
  take: number;
};

type SearchArgs = {
  where: { role?: string; expertProfile?: unknown };
  take: number;
};

async function buildService(prisma: unknown): Promise<ExpertService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ExpertService,
      { provide: PrismaService, useValue: prisma },
      { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      { provide: ExpertScoringService, useValue: {} },
      { provide: ExpertRecommendationService, useValue: {} },
      { provide: NotificationMessageBuilder, useValue: {} },
    ],
  }).compile();

  return module.get<ExpertService>(ExpertService);
}

describe('ExpertService', () => {
  let service: ExpertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertService,
        { provide: PrismaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: ExpertScoringService, useValue: {} },
        { provide: ExpertRecommendationService, useValue: {} },
        { provide: NotificationMessageBuilder, useValue: {} },
      ],
    }).compile();

    service = module.get<ExpertService>(ExpertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll (annuaire)', () => {
    it('pagine, filtre par domaine/disponibilité et nettoie la recherche', async () => {
      let findArgs: FindManyArgs | undefined;
      let countArgs: { where: unknown } | undefined;

      const prisma = {
        $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
        expertProfile: {
          findMany: jest.fn((args: FindManyArgs) => {
            findArgs = args;
            return Promise.resolve([
              {
                id: 'expert-1',
                headline: 'Spécialiste climat',
                availability_status: 'AVAILABLE',
                user: {
                  id: 'user-1',
                  email: 'awa@test.com',
                  password_hash: 'secret-hash',
                  verification_token: 'secret-token',
                  profile: { first_name: 'Awa', last_name: 'Diallo' },
                },
                expertiseConnections: [
                  {
                    id: 'conn-1',
                    level: 'senior',
                    years_of_experience: 8,
                    expertiseArea: {
                      id: 'area-1',
                      name: 'Climat',
                      category: 'Environnement',
                    },
                  },
                ],
              },
            ]);
          }),
          count: jest.fn((args: { where: unknown }) => {
            countArgs = args;
            return Promise.resolve(1);
          }),
        },
      };

      const result = await (
        await buildService(prisma)
      ).findAll({
        q: '  climat  ',
        expertiseAreaId: 'area-1',
        availability: 'AVAILABLE',
        page: 2,
        limit: 999,
      });

      expect(findArgs?.skip).toBe(50); // page 2 avec une limite plafonnée à 50
      expect(findArgs?.take).toBe(50);
      expect(findArgs?.where.availability_status).toBe('AVAILABLE');
      expect(findArgs?.where.expertiseConnections).toEqual({
        some: { expertise_area_id: 'area-1' },
      });
      expect(JSON.stringify(findArgs?.where.OR)).toContain('climat');
      expect(countArgs?.where).toEqual(findArgs?.where);
      expect(result).toMatchObject({ total: 1, page: 2, limit: 50 });

      const items = result.items as Array<Record<string, unknown>>;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('expert-1');
      expect(items[0].user).toEqual({
        id: 'user-1',
        email: 'awa@test.com',
        profile: { first_name: 'Awa', last_name: 'Diallo' },
      });
      expect(items[0].expertiseConnections).toEqual([
        {
          id: 'conn-1',
          level: 'senior',
          years_of_experience: 8,
          expertiseArea: {
            id: 'area-1',
            name: 'Climat',
            category: 'Environnement',
          },
        },
      ]);
      // Aucun champ sensible du compte ne doit fuiter dans l'annuaire.
      const payload = JSON.stringify(items[0]);
      expect(payload).not.toContain('secret-hash');
      expect(payload).not.toContain('secret-token');
      expect(payload).not.toContain('password_hash');
    });

    it('applique les valeurs par défaut et ignore une disponibilité invalide', async () => {
      let findArgs: FindManyArgs | undefined;

      const prisma = {
        $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
        expertProfile: {
          findMany: jest.fn((args: FindManyArgs) => {
            findArgs = args;
            return Promise.resolve([]);
          }),
          count: jest.fn(() => Promise.resolve(0)),
        },
      };

      const result = await (
        await buildService(prisma)
      ).findAll({
        availability: 'PAS_UN_STATUT',
      });

      expect(findArgs?.skip).toBe(0);
      expect(findArgs?.take).toBe(12);
      expect(findArgs?.where).toEqual({});
      expect(result).toEqual({ items: [], total: 0, page: 1, limit: 12 });
    });
  });

  describe('searchUsers', () => {
    it('renvoie un tableau vide sans requête', async () => {
      const findMany = jest.fn();
      const prisma = { user: { findMany } };

      await expect(
        (await buildService(prisma)).searchUsers('   '),
      ).resolves.toEqual([]);
      expect(findMany).not.toHaveBeenCalled();
    });

    it('restreint la recherche aux experts ayant un profil', async () => {
      let searchArgs: SearchArgs | undefined;

      const prisma = {
        user: {
          findMany: jest.fn((args: SearchArgs) => {
            searchArgs = args;
            return Promise.resolve([{ id: 'user-1' }]);
          }),
        },
      };

      const result = await (await buildService(prisma)).searchUsers('marie', 5);

      expect(searchArgs?.where.role).toBe('EXPERT');
      expect(searchArgs?.where.expertProfile).toEqual({ isNot: null });
      expect(searchArgs?.take).toBe(5);
      expect(result).toEqual([{ id: 'user-1' }]);
    });
  });
});
