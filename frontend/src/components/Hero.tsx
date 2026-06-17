export default function Hero() {
  return (
    <section className="relative max-w-[880px] mx-auto text-center px-6 pt-[120px] pb-[72px]">
      {/* Background gradient decoration */}
      <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-moss/[0.08] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="animate-slideUp">
        <div className="inline-flex items-center gap-1.5 bg-moss-light text-moss text-[11px] font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase border border-moss/20 shadow-[0_1px_4px_rgba(29,158,117,0.08)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-moss" />
          </span>
          Infrastructure digitale · Tunisie
        </div>

        <h1 className="font-syne text-[clamp(32px,5.5vw,56px)] font-bold leading-[1.1] text-ink mb-[20px] tracking-tight">
          De l&apos;idée au projet<br />
          <span className="text-gradient">structuré et finançable</span>
        </h1>

        <p className="text-base sm:text-lg text-ink2 leading-relaxed max-w-[560px] mx-auto mb-10">
          ToolBox guide les porteurs de projet étape par étape. Structuration intelligente,
          livrables standardisés, décision facilitée pour les incubateurs.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl bg-moss text-white hover:bg-moss-dark transition-all duration-200 shadow-[0_4px_14px_rgba(29,158,117,0.25)] hover:shadow-[0_6px_20px_rgba(29,158,117,0.35)] hover:-translate-y-px active:translate-y-0"
          >
            Créer mon projet
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-xl bg-surface border border-border text-ink hover:bg-cream hover:border-moss/20 transition-all duration-200 shadow-sm"
          >
            Voir comment ça marche
          </a>
        </div>
      </div>
    </section>
  )
}
