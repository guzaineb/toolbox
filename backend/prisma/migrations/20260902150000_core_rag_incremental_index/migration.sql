-- RAG incremental indexing state (ChromaDB per-chunk)
CREATE TABLE "rag_documents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "document_key" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "chroma_id" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "module" TEXT,
    "section" TEXT,
    "source" TEXT,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "page" INTEGER,
    "dimension" INTEGER NOT NULL DEFAULT 384,
    "distance_fn" TEXT NOT NULL DEFAULT 'cosine',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_documents_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "rag_documents_project_id_document_key_chunk_index_key" ON "rag_documents"("project_id", "document_key", "chunk_index");
CREATE INDEX "rag_documents_project_id_document_key_idx" ON "rag_documents"("project_id", "document_key");

-- Foreign key to projects
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
