import api from './api'
import type {
  ProjectState,
  ChatMessage,
  ChatbotAskResult,
  UploadedDocumentsResult,
  Conversation,
  ConversationMessage,
  RagHealthResult,
} from '@/types/coach'

// ── Project State ──

export async function getProjectState(projectId: string): Promise<ProjectState> {
  const { data } = await api.get(`/ai/project-state/${projectId}`)
  return data.data ?? data
}

// ── Chat ──

export async function askCoach(
  projectId: string,
  question: string,
  conversationHistory?: ChatMessage[],
): Promise<ChatbotAskResult> {
  const { data } = await api.post('/ai/chatbot/ask', {
    projectId,
    question,
    conversationHistory,
  })
  return data.data
}

export async function indexProject(projectId: string): Promise<{ documentsIndexed: number }> {
  const { data } = await api.post('/ai/chatbot/index', { projectId })
  return data.data
}

// ── Documents ──

export async function uploadDocument(
  projectId: string,
  file: File,
): Promise<{ id: string; filename: string; originalName: string; status: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)

  const { data } = await api.post('/ai/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function indexDocument(
  documentId: string,
  projectId: string,
): Promise<{ chunksIndexed: number }> {
  const { data } = await api.post('/ai/documents/index', { documentId, projectId })
  return data.data
}

export async function listDocuments(
  projectId: string,
  page = 1,
  limit = 20,
): Promise<UploadedDocumentsResult> {
  const { data } = await api.get('/ai/documents', {
    params: { projectId, page, limit },
  })
  return data.data
}

export async function deleteDocument(documentId: string, projectId: string): Promise<void> {
  await api.delete(`/ai/documents/${documentId}`, { params: { projectId } })
}

// ── Voice ──

export async function transcribeAudio(
  projectId: string,
  audioBlob: Blob,
  language?: string,
): Promise<{ text: string; language?: string; duration?: number }> {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('projectId', projectId)
  if (language) formData.append('language', language)

  const { data } = await api.post('/ai/voice/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// ── Conversations ──

export async function listConversations(
  projectId: string,
): Promise<Conversation[]> {
  const { data } = await api.get('/ai/conversations', { params: { projectId } })
  return data.data?.conversations ?? data.data ?? []
}

export async function listConversationMessages(
  conversationId: string,
  projectId: string,
): Promise<ConversationMessage[]> {
  const { data } = await api.get(`/ai/conversations/${conversationId}/messages`, {
    params: { projectId },
  })
  return data.data?.messages ?? data.data ?? []
}

// ── RAG Health ──

export async function getRagHealth(projectId: string): Promise<RagHealthResult> {
  const { data } = await api.get('/ai/rag/health', { params: { projectId } })
  return data.data
}
