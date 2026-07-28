'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotificationDetailPage() {
  const params = useParams();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/dashboard/notifications" className="inline-flex items-center gap-2 text-sm text-ink3 hover:text-ink mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux notifications
      </Link>
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <h1 className="text-xl font-bold text-ink mb-2">Notification</h1>
        <p className="text-ink3">Identifiant : {params.id}</p>
        <p className="text-ink3 mt-4">
          Les détails de cette notification seront affichés ici.
        </p>
      </div>
    </div>
  );
}
