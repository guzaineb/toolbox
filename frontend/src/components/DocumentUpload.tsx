'use client';

import { useState } from 'react';
import api from '../services/api';

export default function DocumentUpload({ incubatorId, onSuccess }: { incubatorId: string; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('commerce_register');

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);
    await api.post(`/incubators/${incubatorId}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    onSuccess();
    setFile(null);
  };

  return (
    <div className="border p-4 rounded">
      <select value={docType} onChange={e => setDocType(e.target.value)} className="border p-2 mr-2">
        <option value="commerce_register">Registre de commerce</option>
        <option value="legal_doc">Document légal</option>
        <option value="tax_certificate">Attestation fiscale</option>
      </select>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={!file} className="bg-green-500 text-white p-2 ml-2">Upload</button>
    </div>
  );
}