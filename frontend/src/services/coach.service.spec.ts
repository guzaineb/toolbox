import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { askCoach, indexProject, listConversations } from './coach.service'

vi.mock('./api', () => ({
  __esModule: true,
  default: { get: vi.fn(), post: vi.fn() },
}))
vi.mock('axios', () => ({ default: {} }))

const getMock = vi.mocked(api.get)
const postMock = vi.mocked(api.post)

function ok(body: unknown) {
  return Promise.resolve({
    data: { success: true, data: body },
  } as unknown as Awaited<ReturnType<typeof api.post>>)
}

const ASK_RESULT = {
  answer: 'Passez à la phase 2.',
  sources: [],
  sourcesUsed: [],
  ragStatus: 'RAG_AVAILABLE' as const,
  contextUsed: true,
  toolsUsed: [],
  conversationId: 'conv-1',
}

describe('coach service — contrat AI Coach (/ai/chatbot/*)', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('askCoach envoie projectId + question et déballe data.data', async () => {
    postMock.mockReturnValue(ok(ASK_RESULT))

    const result = await askCoach('proj-1', 'Quelle est ma prochaine action ?')

    expect(postMock).toHaveBeenCalledWith('/ai/chatbot/ask', {
      projectId: 'proj-1',
      question: 'Quelle est ma prochaine action ?',
    })
    expect(result).toEqual(ASK_RESULT)
  })

  it('askCoach inclut conversationHistory (mémoire client) si fournie', async () => {
    postMock.mockReturnValue(ok(ASK_RESULT))
    const history = [
      { role: 'user' as const, content: 'Bonjour' },
      { role: 'assistant' as const, content: 'Bonjour' },
    ]

    const result = await askCoach('proj-1', 'Suite ?', { conversationHistory: history })

    expect(postMock).toHaveBeenCalledWith('/ai/chatbot/ask', {
      projectId: 'proj-1',
      question: 'Suite ?',
      conversationHistory: history,
    })
    expect(result.answer).toBe('Passez à la phase 2.')
  })

  it('askCoach fusionne le contexte de module (AI Coach contextuel) sans casser le contrat', async () => {
    postMock.mockReturnValue(ok(ASK_RESULT))

    const result = await askCoach('proj-1', 'Analysez cette étape', {
      conversationHistory: [{ role: 'user' as const, content: 'Déjà vu' }],
      moduleContext: { module: 'GBM', step: 'gbm_6', context: '{ value: 1 }' },
    })

    expect(postMock).toHaveBeenCalledWith('/ai/chatbot/ask', {
      projectId: 'proj-1',
      question: 'Analysez cette étape',
      conversationHistory: [{ role: 'user', content: 'Déjà vu' }],
      module: 'GBM',
      step: 'gbm_6',
      context: '{ value: 1 }',
    })
    expect(result.conversationId).toBe('conv-1')
  })

  it('indexProject envoie projectId et déballe documentsIndexed', async () => {
    postMock.mockReturnValue(ok({ documentsIndexed: 5 }))

    const result = await indexProject('proj-2')

    expect(postMock).toHaveBeenCalledWith('/ai/chatbot/index', { projectId: 'proj-2' })
    expect(result).toEqual({ documentsIndexed: 5 })
  })

  it('listConversations déballe le tableau conversations (avec projectId en query)', async () => {
    getMock.mockReturnValue(
      Promise.resolve({
        data: {
          success: true,
          data: { conversations: [{ id: 'conv-1', messageCount: 2 }], total: 1 },
        },
      } as unknown as Awaited<ReturnType<typeof api.get>>),
    )

    const result = await listConversations('proj-3')

    expect(getMock).toHaveBeenCalledWith('/ai/conversations', { params: { projectId: 'proj-3' } })
    expect(result).toEqual([{ id: 'conv-1', messageCount: 2 }])
  })
})