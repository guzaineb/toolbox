import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold">Bienvenue sur ProjectStruct</h1>
      <p className="mt-4">Gérez incubateurs, experts et projets.</p>
      <div className="mt-8 space-x-4">
        <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded">S&apos;inscrire</Link>
        <Link href="/login" className="bg-gray-500 text-white px-4 py-2 rounded">Se connecter</Link>
      </div>
    </div>
  );
}