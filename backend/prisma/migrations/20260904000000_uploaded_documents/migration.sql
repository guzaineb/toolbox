-- CreateEnum
CREATE TYPE "UploadedDocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'INDEXED', 'FAILED');

-- CreateTable
CREATE TABLE "uploaded_documents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "UploadedDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "chunk_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexed_at" TIMESTAMP(3),

    CONSTRAINT "uploaded_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uploaded_documents_project_id_idx" ON "uploaded_documents"("project_id");

-- CreateIndex
CREATE INDEX "uploaded_documents_project_id_owner_id_idx" ON "uploaded_documents"("project_id", "owner_id");

-- AddForeignKey
ALTER TABLE "uploaded_documents" ADD CONSTRAINT "uploaded_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
