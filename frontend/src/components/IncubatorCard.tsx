import Link from 'next/link';

export default function IncubatorCard({ incubator }: { incubator: any }) {
  return (
    <Link href={`/dashboard/incubator/${incubator.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer">
        <h3 className="text-xl font-semibold mb-2">{incubator.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{incubator.description}</p>
        <div className="flex justify-between items-center">
          <span className={`text-sm px-2 py-1 rounded ${
            incubator.verification_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
            incubator.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {incubator.verification_status}
          </span>
          <span className="text-blue-600">Voir détails →</span>
        </div>
      </div>
    </Link>
  );
}