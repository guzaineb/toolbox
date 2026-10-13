import { Test, TestingModule } from '@nestjs/testing';
import {
  cosineSimilarity,
  semanticScoreFromCosine,
  ExpertSemanticRanker,
} from './expert-semantic-ranker.service';
import { EmbeddingsService } from '../../ai/embeddings.service';
import { LlmService } from '../../ai/llm.service';

describe('ExpertSemanticRanker', () => {
  let ranker: ExpertSemanticRanker;

  const embeddings = { generate: jest.fn() };
  const llm = { generate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertSemanticRanker,
        { provide: EmbeddingsService, useValue: embeddings },
        { provide: LlmService, useValue: llm },
      ],
    }).compile();

    ranker = module.get<ExpertSemanticRanker>(ExpertSemanticRanker);
  });

  describe('similarité cosine', () => {
    it('vaut 1 pour deux vecteurs identiques', () => {
      expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 6);
    });

    it('vaut 0 pour deux vecteurs orthogonaux ou de tailles différentes', () => {
      expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
      expect(cosineSimilarity([1, 0], [0, 1, 2])).toBe(0);
    });

    it('vaut 0 sans division par zéro sur un vecteur nul', () => {
      expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
    });

    it('convertit la similarité en score 0-100 borné', () => {
      expect(semanticScoreFromCosine(0.82)).toBe(82);
      expect(semanticScoreFromCosine(-0.4)).toBe(0);
      expect(semanticScoreFromCosine(1.4)).toBe(100);
      expect(semanticScoreFromCosine(Number.NaN)).toBe(0);
    });
  });

  describe('buildExpertText', () => {
    it('assemble les faits du profil expert', () => {
      const text = ranker.buildExpertText({
        id: 'e1',
        headline: 'Experte en finance verte',
        organization: 'GreenBank',
        position: 'Directrice financière',
        bio: 'Dix ans en finance durable.',
        years_of_experience: 10,
        user: { profile: { first_name: 'Ada', last_name: 'Lovelace' } },
        expertiseConnections: [
          {
            level: 'senior',
            expertiseArea: { name: 'Finance', category: 'Comptabilité' },
          },
        ],
      });

      expect(text).toContain('Experte en finance verte');
      expect(text).toContain('Directrice financière chez GreenBank');
      expect(text).toContain('Finance — Comptabilité — niveau senior');
      expect(text).toContain("10 ans d'expérience");
    });

    it('déduit un libellé depuis le nom ou le titre', () => {
      expect(
        ranker.expertLabel({
          id: 'e1',
          headline: 'Experte en finance',
          user: { profile: { first_name: 'Ada', last_name: 'Lovelace' } },
        }),
      ).toBe('Ada Lovelace');
      expect(
        ranker.expertLabel({ id: 'e2', headline: 'Expert marketing' }),
      ).toBe('Expert marketing');
      expect(ranker.expertLabel({ id: 'e3' })).toBe('Expert');
    });
  });

  describe('scoreBatch', () => {
    it('renvoie un score par expert à partir des embeddings', async () => {
      embeddings.generate.mockResolvedValue([
        [1, 0],
        [1, 0],
        [0, 1],
      ]);

      const scores = await ranker.scoreBatch('projet finance verte', [
        { id: 'expert-a', text: 'profil finance' },
        { id: 'expert-b', text: 'profil marketing' },
      ]);

      expect(embeddings.generate).toHaveBeenCalledWith([
        'projet finance verte',
        'profil finance',
        'profil marketing',
      ]);
      expect(scores).not.toBeNull();
      expect(scores?.get('expert-a')).toBe(100);
      expect(scores?.get('expert-b')).toBe(0);
    });

    it('substitue un texte par défaut pour un profil vide', async () => {
      embeddings.generate.mockResolvedValue([
        [1, 0],
        [1, 0],
      ]);

      await ranker.scoreBatch('contexte', [{ id: 'expert-a', text: '   ' }]);

      expect(embeddings.generate).toHaveBeenCalledWith([
        'contexte',
        'Profil expert sans description renseignée.',
      ]);
    });

    it('ne calcule rien sans expert candidat', async () => {
      const scores = await ranker.scoreBatch('contexte', []);

      expect(scores?.size).toBe(0);
      expect(embeddings.generate).not.toHaveBeenCalled();
    });

    it('renvoie null (repli sur les règles) si les embeddings échouent', async () => {
      embeddings.generate.mockRejectedValue(
        new Error('modèle local indisponible'),
      );

      await expect(
        ranker.scoreBatch('contexte', [{ id: 'expert-a', text: 'profil' }]),
      ).resolves.toBeNull();
    });

    it('renvoie null si le nombre de vecteurs ne correspond pas aux textes', async () => {
      embeddings.generate.mockResolvedValue([[1, 0]]);

      await expect(
        ranker.scoreBatch('contexte', [{ id: 'expert-a', text: 'profil' }]),
      ).resolves.toBeNull();
    });

    it('renvoie null sans texte de contexte exploitable', async () => {
      await expect(
        ranker.scoreBatch('   ', [{ id: 'expert-a', text: 'profil' }]),
      ).resolves.toBeNull();
      expect(embeddings.generate).not.toHaveBeenCalled();
    });
  });

  describe('explainBatch', () => {
    const candidates = [
      { id: 'expert-a', label: 'Ada Lovelace', areas: ['Finance'], score: 82 },
      { id: 'expert-b', label: 'Alan Turing', areas: [], score: 31 },
    ];

    it('associe les explications LLM à chaque candidat', async () => {
      let capturedPrompt = '';
      llm.generate.mockImplementation((prompt: string) => {
        capturedPrompt = prompt;
        return Promise.resolve({
          content:
            '{"explanations":["Finance verte maîtrisée.","Profil plus éloigné."]}',
          model: 'test',
        });
      });

      const explanations = await ranker.explainBatch('contexte', candidates);

      expect(explanations.get('expert-a')).toBe('Finance verte maîtrisée.');
      expect(explanations.get('expert-b')).toBe('Profil plus éloigné.');
      // Le prompt transmet les faits calculés au modèle.
      expect(capturedPrompt).toContain('Ada Lovelace');
      expect(capturedPrompt).toContain('similarité sémantique : 82%');
    });

    it('tolère un bloc markdown JSON', async () => {
      llm.generate.mockResolvedValue({
        content: 'Voici :\n```json\n{"explanations":["Une explication."]}\n```',
        model: 'test',
      });

      const explanations = await ranker.explainBatch('contexte', candidates);

      expect(explanations.get('expert-a')).toBe('Une explication.');
      expect(explanations.has('expert-b')).toBe(false);
    });

    it('renvoie une map vide quand le LLM échoue', async () => {
      llm.generate.mockRejectedValue(new Error('429 rate limit'));

      await expect(
        ranker.explainBatch('contexte', candidates),
      ).resolves.toEqual(new Map());
    });

    it('renvoie une map vide sans JSON exploitable', async () => {
      llm.generate.mockResolvedValue({
        content: 'Je ne peux pas répondre.',
        model: 'test',
      });

      const explanations = await ranker.explainBatch('contexte', candidates);

      expect(explanations.size).toBe(0);
    });

    it("n'appelle pas le LLM sans candidat retenu", async () => {
      const explanations = await ranker.explainBatch('contexte', []);

      expect(explanations.size).toBe(0);
      expect(llm.generate).not.toHaveBeenCalled();
    });
  });
});
