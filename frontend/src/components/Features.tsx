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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3l5 5-5 5" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      iconBg: 'bg-accent-light',
      title: 'Parcours guidé',
      description: 'Structurez votre projet étape par étape, sans expertise préalable requise.'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5" stroke="#378ADD" strokeWidth="1.5"/>
          <path d="M8 5v3l2 2" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      iconBg: 'bg-blue-light',
      title: 'Suivi en temps réel',
      description: 'Incubateurs et coachs suivent la progression de chaque projet instantanément.'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="#BA7517" strokeWidth="1.5"/>
          <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#BA7517" strokeWidth="1.5"/>
        </svg>
      ),
      iconBg: 'bg-amber-light',
      title: 'Cohortes flexibles',
      description: 'Un projet existe indépendamment — rejoignez ou quittez une cohorte librement.'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11l-3.6 1.9.7-4L2.2 6.2l4-.6L8 2z" stroke="#E24B4A" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      iconBg: 'bg-red-light',
      title: 'Évaluation standardisée',
      description: 'Les jurys notent selon des critères clairs. Comparaison objective entre projets.'
    }
  ]

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-[72px]" id="features">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-8 text-center">
        Ce que vous obtenez
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-xl p-[22px_20px]">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3.5 ${feature.iconBg}`}>
              {feature.icon}
            </div>
            <h3 className="text-sm font-semibold text-text mb-1.5">{feature.title}</h3>
            <p className="text-[13px] text-text-2 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}