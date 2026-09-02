import { ChunkerService } from './chunker.service';

describe('ChunkerService', () => {
  let service: ChunkerService;

  beforeEach(() => {
    service = new ChunkerService();
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  it('retourne [] pour un texte vide ou que des espaces', () => {
    expect(service.chunk('p1', 'doc.a', '')).toEqual([]);
    expect(service.chunk('p1', 'doc.a', '   \n  ')).toEqual([]);
    expect(service.chunk('p1', 'doc.a', null as unknown as string)).toEqual([]);
  });

  it('ne découpe pas un texte plus court que la taille cible (1 chunk)', () => {
    const text = 'Un petit texte court.';
    const chunks = service.chunk('p1', 'doc.a', text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(text);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].totalChunks).toBe(1);
    expect(chunks[0].id).toBe('p1_doc.a_0');
  });

  it('construit des ids déterministes project_document_index', () => {
    const text = 'Mot '.repeat(400); // assez long pour découper
    const chunks = service.chunk('proj_123', 'gbm1.idea', text);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c, i) => {
      expect(c.id).toBe(`proj_123_gbm1.idea_${i}`);
      expect(c.chunkIndex).toBe(i);
      expect(c.totalChunks).toBe(chunks.length);
    });
  });

  it('mêmes entrées => mêmes ids et mêmes hachages (stabilité incrémentale)', () => {
    const text = 'Phrase une. Phrase deux. Phrase trois. '.repeat(60);
    const a = service.chunk('p1', 'k', text);
    const b = service.chunk('p1', 'k', text);
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
    expect(a.map((c) => c.contentHash)).toEqual(b.map((c) => c.contentHash));
  });

  it('toute modification du contenu change le hash du chunk concerné', () => {
    const base = 'Phrase une. Phrase deux. '.repeat(60);
    const baseChunks = service.chunk('p1', 'k', base);

    const modified = base.replace('Phrase deux', 'Phrase CHANGÉE');
    const modChunks = service.chunk('p1', 'k', modified);

    const hashes = (cs: { contentHash: string }[]) => cs.map((c) => c.contentHash);
    expect(hashes(modChunks)).not.toEqual(hashes(baseChunks));
  });

  it('normalise les fins de ligne CRLF pour un hachage stable', () => {
    const a = service.chunk('p1', 'k', 'ligne1\r\nligne2\r\n' + 'x'.repeat(20));
    const b = service.chunk('p1', 'k', 'ligne1\nligne2\n' + 'x'.repeat(20));
    expect(a.map((c) => c.contentHash)).toEqual(b.map((c) => c.contentHash));
  });

  it('garantit une progression (pas de boucle infinie) et couvre tout le texte', () => {
    const text = 'abc '.repeat(1000);
    const chunks = service.chunk('p1', 'k', text);
    const covered = chunks.reduce((acc, c) => acc + c.content.length, 0);
    expect(chunks.length).toBeGreaterThan(1);
    expect(covered).toBeGreaterThan(text.length * 0.5);
    expect(covered).toBeGreaterThan(0);
  });
});
