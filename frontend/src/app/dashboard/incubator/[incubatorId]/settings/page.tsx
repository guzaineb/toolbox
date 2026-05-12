'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui';

interface Incubator {
  id: string;
  name: string;
  status: 'active' | 'suspended';
  verification_status: 'pending' | 'approved' | 'rejected';
}

export default function IncubatorSettingsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();
  const router = useRouter();
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!incubatorId) return;
    api.get(`/incubators/${incubatorId}`)
      .then((res) => setIncubator(res.data))
      .finally(() => setLoading(false));
  }, [incubatorId]);

  const doAction = async (
    action: string,
    fn: () => Promise<any>,
    redirect?: string,
  ) => {
    setError(null);
    setLoadingAction(action);
    try {
      await fn();
      if (redirect) {
        router.push(redirect);
      } else {
        const res = await api.get(`/incubators/${incubatorId}`);
        setIncubator(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Une erreur est survenue');
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleStatus = () =>
    doAction('status', () =>
      api.patch(`/incubators/${incubatorId}/status`, {
        status: incubator?.status === 'active' ? 'suspended' : 'active',
      }),
    );

  const setVerification = (v: 'approved' | 'rejected') =>
    doAction('verification', () =>
      api.patch(`/incubators/${incubatorId}/verification`, {
        verification_status: v,
      }),
    );

  const deleteIncubator = () =>
    doAction(
      'delete',
      () => api.delete(`/incubators/${incubatorId}`),
      '/dashboard/incubator',
    );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-48 bg-border rounded" />
          <div className="h-24 bg-border rounded mt-4" />
        </div>
      </div>
    );
  }

  if (!incubator) {
    return (
      <div className="p-8">
        <Card className="text-center py-8">
          <p className="text-text-2">Incubateur introuvable.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[580px]">
      <div className="mb-6">
        <h1 className="font-display text-[26px] mb-1">Paramètres</h1>
        <p className="text-[13px] text-text-2">{incubator.name}</p>
      </div>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      {/* Statut */}
      <Card className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-4">
          Statut de l'incubateur
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium mb-1">
              Statut actuel :{' '}
              <Badge variant={incubator.status === 'active' ? 'blue' : 'gray'}>
                {incubator.status === 'active' ? 'Actif' : 'Suspendu'}
              </Badge>
            </div>
            <p className="text-[12px] text-text-2">
              {incubator.status === 'active'
                ? "Suspendre rend l'incubateur invisible pour les porteurs de projet."
                : "Réactiver rend l'incubateur visible et actif."}
            </p>
          </div>
          <Button
            variant={incubator.status === 'active' ? 'default' : 'primary'}
            loading={loadingAction === 'status'}
            onClick={toggleStatus}
            className="ml-4 flex-shrink-0"
          >
            {incubator.status === 'active' ? 'Suspendre' : 'Réactiver'}
          </Button>
        </div>
      </Card>

      {/* Vérification */}
      <Card className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-4">
          Vérification
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px]">Statut :</span>
          <Badge
            variant={
              incubator.verification_status === 'approved'
                ? 'green'
                : incubator.verification_status === 'rejected'
                ? 'red'
                : 'amber'
            }
          >
            {incubator.verification_status === 'approved'
              ? 'Approuvé'
              : incubator.verification_status === 'rejected'
              ? 'Rejeté'
              : 'En attente'}
          </Badge>
        </div>
        <p className="text-[12px] text-text-2 mb-4">
          La vérification confirme la légitimité de l'organisation. 
          En production, seuls les administrateurs de la plateforme peuvent approuver.
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            loading={loadingAction === 'verification'}
            onClick={() => setVerification('approved')}
            disabled={incubator.verification_status === 'approved'}
          >
            Approuver
          </Button>
          <Button
            loading={loadingAction === 'verification'}
            onClick={() => setVerification('rejected')}
            disabled={incubator.verification_status === 'rejected'}
          >
            Rejeter
          </Button>
        </div>
      </Card>

      {/* Zone danger */}
      <Card className="border-red-200">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-red-500 mb-4">
          Zone de danger
        </div>
        {!confirmDelete ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium mb-1">Supprimer l'incubateur</div>
              <p className="text-[12px] text-text-2">
                Cette action est irréversible. Toutes les données seront perdues.
              </p>
            </div>
            <Button
              className="ml-4 flex-shrink-0 !border-red-300 !text-red-600 hover:!bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              Supprimer
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-[13px] font-medium text-red-600 mb-3">
              ⚠ Êtes-vous certain de vouloir supprimer « {incubator.name} » ?
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
              <Button
                loading={loadingAction === 'delete'}
                className="!bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
                onClick={deleteIncubator}
              >
                Oui, supprimer définitivement
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
