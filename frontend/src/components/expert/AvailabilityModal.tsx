import { useState } from "react";
import { AvailabilityBadge } from "./AvailabilityBadge";

export function AvailabilityModal({
  currentStatus, onClose, onUpdate, showToast, refreshData
}: {
  currentStatus: string;
  onClose: () => void;
  onUpdate: (status: any) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error') => void;
  refreshData: () => Promise<void>;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await onUpdate(status);
      await refreshData();
      showToast('Disponibilité mise à jour', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold text-ink mb-4">Changer ma disponibilité</h3>
        <div className="space-y-3 mb-6">
          {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                status === s ? 'border-moss bg-moss/[.04]' : 'border-border hover:border-moss/40'
              }`}
            >
              <AvailabilityBadge status={s} size="lg" />
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-moss/5">
            Annuler
          </button>
          <button onClick={handleUpdate} disabled={updating} className="flex-1 px-4 py-2 bg-moss text-white rounded-lg hover:bg-moss-dark disabled:opacity-50">
            {updating ? 'Mise à jour...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}