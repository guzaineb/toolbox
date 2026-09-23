import api from './api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatbotAskResult {
  answer: string
  sources: unknown[]
  contextUsed: boolean
}

export const chatbotService = {
  async ask(projectId: string, question: string, conversationHistory: ChatMessage[]) {
    const { data } = await api.post('/ai/chatbot/ask', {
      projectId,
      question,
      conversationHistory,
    })
    return data as { success: boolean; data: ChatbotAskResult }
  },

  async indexProject(projectId: string) {
    const { data } = await api.post('/ai/chatbot/index', { projectId })
    return data as { success: boolean; data: { documentsIndexed: number } }
  },
}
