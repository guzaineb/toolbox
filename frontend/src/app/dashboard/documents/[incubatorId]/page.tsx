'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../services/api';
import DocumentUpload from '../../../../components/DocumentUpload';

export default function Documents() {
  const { incubatorId } = useParams();
  const [docs, setDocs] = useState([]);

  const fetchDocs = async () => {
    const res = await api.get(`/incubators/${incubatorId}/documents`);
    setDocs(res.data);
  };

  useEffect(() => {
    if (incubatorId) fetchDocs();
  }, [incubatorId]);

  const onUploadSuccess = () => fetchDocs();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Documents de l'incubateur</h1>
      <DocumentUpload incubatorId={incubatorId as string} onSuccess={onUploadSuccess} />
      <ul className="mt-4">
        {docs.map((doc: any) => (
          <li key={doc.id} className="border p-2 my-2">
            {doc.document_type} – Statut: {doc.verification_status}
          </li>
        ))}
      </ul>
    </div>
  );
}