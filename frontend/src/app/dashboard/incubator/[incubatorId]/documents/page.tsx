'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import api from '@/services/api';
import { Badge, Button, Card, ErrorAlert, Field, Select } from '@/components/shared/ui';

interface Doc {
  id: string;
  document_type: string;
  file_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  uploaded_at?: string;
  uploaded_by_user_id?: string;
  rejection_reason?: string; // Ajout
  uploaded_by?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

const DOC_TYPES = [
  { value: 'commerce_register', label: 'Registre de commerce' },
  { value: 'legal_doc', label: 'Document légal' },
  { value: 'tax_certificate', label: 'Attestation fiscale' },
  { value: 'institutional_proof', label: 'Preuve institutionnelle' },
];

const STATUS_BADGE: Record<string, 'amber' | 'green' | 'red'> = {
  pending: 'amber', approved: 'green', rejected: 'red',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté',
};

export default function DocumentsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('registre_commerce');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDocs = () => {
    if (!incubatorId) return;
    api.get(`/incubators/${incubatorId}/documents`)
      .then(res => setDocs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, [incubatorId]);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('document_type', docType);
    try {
      await api.post(`/incubators/${incubatorId}/documents/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocs();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (docId: string) => {
    setError(null);
    setDeletingId(docId);
    try {
      await api.delete(`/incubators/${incubatorId}/documents/${docId}`);
      fetchDocs();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerify = async (docId: string, status: 'approved' | 'rejected', reason?: string) => {
    setError(null);
    setVerifyingId(docId);
    try {
      await api.patch(`/incubators/${incubatorId}/documents/${docId}/verify`, {
        verification_status: status,
        rejection_reason: reason,
      });
      fetchDocs();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur vérification');
    } finally {
      setVerifyingId(null);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="p-8 max-w-[700px]">
      <h1 className="font-display text-[26px] mb-1">Documents</h1>
      <p className="text-[13px] text-text-2 mb-7">
        Uploadez les documents pour la vérification de votre incubateur
      </p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      {/* Upload zone */}
      <Card className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Ajouter un document
        </div>
        <Field label="Type de document">
          <Select value={docType} onChange={e => setDocType(e.target.value)}>
            {DOC_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
        <div
          className={`border-[1.5px] border-dashed rounded p-7 text-center cursor-pointer transition-all
            ${dragOver ? 'border-accent bg-accent-light' : 'border-border hover:border-accent hover:bg-accent-light'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="text-[13px] text-text-2 animate-pulse">Envoi en cours…</div>
          ) : (
            <>
              <div className="text-2xl mb-2">⬆</div>
              <div className="text-[13px] font-medium mb-1">Glisser-déposer ou cliquer</div>
              <div className="text-[12px] text-text-2">PDF, JPG, PNG · Max 10 Mo</div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
        />
      </Card>

      {/* Documents list */}
      <Card>
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Documents soumis ({docs.length})
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => <div key={i} className="h-12 bg-border rounded" />)}
          </div>
        ) : docs.length === 0 ? (
          <p className="text-[13px] text-text-2 text-center py-6">Aucun document soumis.</p>
        ) : (
          docs.map(doc => {
            const typeLabel = DOC_TYPES.find(t => t.value === doc.document_type)?.label ?? doc.document_type;
            const isVerifying = verifyingId === doc.id;
            const isDeleting = deletingId === doc.id;

            return (
              <div key={doc.id} className="py-3 border-b border-border last:border-none">
                {/* Ligne principale */}
                <div className="flex items-center gap-3">
                  <div className="text-xl flex-shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{typeLabel}</div>
                    {doc.uploaded_at && (
                      <div className="text-[11px] text-text-2">
                        {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {doc.uploaded_by && (
                      <div className="text-[11px] text-text-2">
                        {doc.uploaded_by.first_name} {doc.uploaded_by.last_name} ({doc.uploaded_by.role})
                      </div>
                    )}
                  </div>

                  <Badge variant={STATUS_BADGE[doc.verification_status] ?? 'gray'}>
                    {STATUS_LABEL[doc.verification_status] ?? doc.verification_status}
                  </Badge>

                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}${doc.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button className="text-[11px] !py-1 !px-2">Voir</Button>
                  </a>

                  <Button
                    className="text-[11px] !py-1 !px-2 !text-red-500 !border-red-200 hover:!bg-red-50"
                    loading={isDeleting}
                    onClick={() => handleDelete(doc.id)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Affichage de la raison de rejet si présente */}
                {doc.verification_status === 'rejected' && doc.rejection_reason && (
                  <div className="mt-2 ml-8 text-red-600 text-[11px] bg-red-50 p-2 rounded">
                    ❌ Raison du rejet : {doc.rejection_reason}
                  </div>
                )}

                {/* Actions de vérification (admin) — visibles si en attente */}
                {doc.verification_status === 'pending' && (
                  <div className="flex gap-2 mt-2 ml-8">
                    <Button
                      variant="primary"
                      className="text-[11px] !py-1 !px-3"
                      loading={isVerifying}
                      onClick={() => handleVerify(doc.id, 'approved')}
                    >
                      ✓ Approuver
                    </Button>
                    
                    {rejectingId === doc.id ? (
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <textarea
                          className="w-full p-2 text-sm border border-border rounded"
                          rows={2}
                          placeholder="Raison du rejet (obligatoire)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            className="text-[11px] !py-1 !px-3 bg-red-500 text-white"
                            loading={isVerifying}
                            onClick={() => {
                              if (!rejectReason.trim()) {
                                setError('Veuillez indiquer une raison de rejet');
                                return;
                              }
                              handleVerify(doc.id, 'rejected', rejectReason);
                            }}
                          >
                            Confirmer le rejet
                          </Button>
                          <Button
                            className="text-[11px] !py-1 !px-3"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="text-[11px] !py-1 !px-3 !text-red-500 !border-red-200 hover:!bg-red-50"
                        onClick={() => setRejectingId(doc.id)}
                      >
                        ✗ Rejeter
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}