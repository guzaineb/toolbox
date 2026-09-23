'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings, ShieldAlert, Power, Trash2, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorAlert,
  SuccessAlert,
} from '@/components/shared/ui';

interface Incubator {
  id: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function IncubatorSettingsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();
  const router = useRouter();
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!incubatorId) return;
    api
      .get(`/incubators/${incubatorId}`)
      .then((res) => setIncubator(res.data))
      .catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false));
  }, [incubatorId]);

  const doAction = async (
    action: string,
    fn: () => Promise<any>,
    successMessage?: string,
    redirect?: string
  ) => {
    setError(null);
    setSuccessMsg(null);
    setLoadingAction(action);
    try {
      await fn();
      if (successMessage) setSuccessMsg(successMessage);
      if (redirect) {
        router.push(redirect);
      } else {
        const res = await api.get(`/incubators/${incubatorId}`);
        setIncubator(res.data);
      }
      // auto-clear success message after 4s
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Une erreur est survenue');
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleStatus = () =>
    doAction(
      'status',
      () =>
        api.patch(`/incubators/${incubatorId}/status`, {
          status: incubator?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
        }),
      incubator?.status === 'ACTIVE'
        ? 'Incubateur suspendu'
        : 'Incubateur réactivé'
    );

  const setVerification = (v: 'APPROVED' | 'REJECTED') =>
    doAction(
      'verification',
      () =>
        api.patch(`/incubators/${incubatorId}/verification`, {
          verification_status: v,
        }),
      v === 'APPROVED' ? 'Incubateur approuvé' : 'Incubateur rejeté'
    );

  const deleteIncubator = () =>
    doAction(
      'delete',
      () => api.delete(`/incubators/${incubatorId}`),
      undefined,
      '/dashboard/incubator'
    );

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-48 bg-border rounded" />
          <div className="h-24 bg-border rounded" />
          <div className="h-48 bg-border rounded" />
        </div>
      </div>
    );
  }

  if (!incubator) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <Card className="text-center py-8">
          <p className="text-ink2">Incubateur introuvable.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}
      {successMsg && (
        <div className="mb-6">
          <SuccessAlert message={successMsg} />
        </div>
      )}

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="font-syne text-2xl font-extrabold text-ink">Paramètres</h1>
        <p className="text-sm text-ink3 mt-1">{incubator.name}</p>
      </div>

      {/* Carte : Statut */}
      <Card className="mb-5 overflow-hidden">
        <CardHeader
          icon={<Power size={15} />}
          title="Statut de l'incubateur"
        />
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-ink">
                Statut actuel :{' '}
                <Badge
                  variant={incubator.status === 'ACTIVE' ? 'green' : 'gray'}
                >
                  {incubator.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                </Badge>
              </div>
              <p className="text-xs text-ink3">
                {incubator.status === 'ACTIVE'
                  ? "Suspendre rend l'incubateur invisible pour les porteurs de projet."
                  : "Réactiver rend l'incubateur visible et actif."}
              </p>
            </div>
            <Button
              variant={incubator.status === 'ACTIVE' ? 'default' : 'primary'}
              loading={loadingAction === 'status'}
              onClick={toggleStatus}
              className="flex-shrink-0"
            >
              {incubator.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Carte : Vérification */}
      <Card className="mb-5 overflow-hidden">
        <CardHeader
          icon={<ShieldAlert size={15} />}
          title="Vérification de légitimité"
        />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-ink">Statut :</span>
            <Badge
              variant={
                incubator.verification_status === 'APPROVED'
                  ? 'green'
                  : incubator.verification_status === 'REJECTED'
                  ? 'red'
                  : 'amber'
              }
            >
              {incubator.verification_status === 'APPROVED'
                ? 'Approuvé'
                : incubator.verification_status === 'REJECTED'
                ? 'Rejeté'
                : 'En attente'}
            </Badge>
          </div>
          <p className="text-xs text-ink3">
            La vérification confirme la légitimité de l'organisation. En
            production, seuls les administrateurs de la plateforme peuvent
            approuver.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              loading={loadingAction === 'verification-approved'}
              onClick={() => setVerification('APPROVED')}
              disabled={incubator.verification_status === 'APPROVED'}
            >
              Approuver
            </Button>
            <Button
              loading={loadingAction === 'verification-rejected'}
              onClick={() => setVerification('REJECTED')}
              disabled={incubator.verification_status === 'REJECTED'}
            >
              Rejeter
            </Button>
          </div>
        </div>
      </Card>

      {/* Carte : Zone danger */}
      <Card className="border-red-200 overflow-hidden">
        <CardHeader
          icon={<AlertTriangle size={15} />}
          title="Zone de danger"
          className="!text-red-600"
        />
        <div className="p-5">
          {!confirmDelete ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-ink">
                  Supprimer l'incubateur
                </div>
                <p className="text-xs text-ink3">
                  Cette action est irréversible. Toutes les données seront
                  perdues.
                </p>
              </div>
              <Button
                className="!border-red-300 !text-red-600 hover:!bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} />
                Supprimer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-red-600">
                ⚠ Êtes-vous certain de vouloir supprimer « {incubator.name} » ?
              </p>
              <div className="flex flex-wrap gap-3">
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
        </div>
      </Card>
    </div>
  );
}