import Link from 'next/link';

export default function IncubatorCard({ incubator }: { incubator: any }) {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="text-xl font-semibold">{incubator.name}</h2>
      <p>Statut: {incubator.verification_status}</p>
      <Link href={`/dashboard/incubator/${incubator.id}`} className="text-blue-500">Voir détails</Link>
    </div>
  );
}