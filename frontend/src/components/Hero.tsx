export default function Hero() {
  return (
    <section className="max-w-[760px] mx-auto text-center px-6 pt-[72px] pb-[60px]">
      <div className="inline-flex items-center gap-1.5 bg-accent-light text-accent text-[11px] font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
        Infrastructure digitale · Tunisie
      </div>
      <h1 className="font-syne text-[clamp(30px,5vw,48px)] font-bold leading-[1.15] text-text mb-[18px]">
        De l'idée au projet<br />
        <span className="text-accent">structuré et finançable</span>
      </h1>
      <p className="text-base text-text-2 leading-relaxed max-w-[520px] mx-auto mb-8">
        ProjectStruct guide les porteurs de projet étape par étape. Structuration intelligente,
        livrables standardisés, décision facilitée pour les incubateurs.
      </p>
      <div className="flex gap-2.5 justify-center flex-wrap">
        <a
          href="#"
          className="text-sm font-medium px-6 py-2.5 rounded-md bg-accent border border-accent text-white hover:bg-accent-mid hover:border-accent-mid transition-all duration-150 inline-flex items-center gap-2"
        >
          Créer mon projet →
        </a>
        <a
          href="#features"
          className="text-sm font-medium px-6 py-2.5 rounded-md bg-surface border border-border text-text hover:bg-bg transition-all duration-150 inline-flex items-center gap-2"
        >
          Voir comment ça marche
        </a>
      </div>
    </section>
  )
}