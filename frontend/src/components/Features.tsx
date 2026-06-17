interface Feature {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}

export default function Features() {
  const features: Feature[] = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      iconBg: 'bg-moss-light',
      title: 'Parcours guidé',
      description: 'Structurez votre projet étape par étape, sans expertise préalable requise.'
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      iconBg: 'bg-blue-light',
      title: 'Suivi en temps réel',
      description: 'Incubateurs et coachs suivent la progression de chaque projet instantanément.'
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      iconBg: 'bg-amber-light',
      title: 'Cohortes flexibles',
      description: 'Un projet existe indépendamment — rejoignez ou quittez une cohorte librement.'
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      iconBg: 'bg-red-light',
      title: 'Évaluation standardisée',
      description: 'Les jurys notent selon des critères clairs. Comparaison objective entre projets.'
    }
  ]

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-[80px]" id="features">
      <div className="text-center mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink3 mb-2">Ce que vous obtenez</div>
        <h2 className="font-syne text-[28px] font-bold text-ink">Une plateforme complète</h2>
        <p className="text-sm text-ink2 mt-2 max-w-md mx-auto">Tout ce dont vous avez besoin pour structurer, suivre et évaluer des projets entrepreneuriaux.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group bg-surface border border-border rounded-xl p-[24px] transition-all duration-200 hover:shadow-card-hover hover:border-moss/20"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-4 ${feature.iconBg} group-hover:scale-110 transition-transform duration-200`}>
              {feature.icon}
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">{feature.title}</h3>
            <p className="text-[13px] text-ink2 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
