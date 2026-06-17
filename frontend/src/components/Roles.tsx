interface Role {
  tag: string
  tagColor: 'green' | 'blue' | 'amber' | 'red'
  title: string
  description: string
}

export default function Roles() {
  const roles: Role[] = [
    {
      tag: 'Porteur de projet',
      tagColor: 'green',
      title: 'Structurez votre idée',
      description: 'Travaillez en autonomie, rejoignez une cohorte, générez un dossier professionnel.'
    },
    {
      tag: 'Incubateur',
      tagColor: 'blue',
      title: 'Gérez vos cohortes',
      description: 'Créez des programmes, suivez les projets, prenez des décisions éclairées.'
    },
    {
      tag: 'Coach',
      tagColor: 'amber',
      title: 'Accompagnez efficacement',
      description: 'Donnez du feedback structuré et suivez la progression de vos porteurs.'
    },
    {
      tag: 'Jury',
      tagColor: 'red',
      title: 'Évaluez objectivement',
      description: 'Consultez, notez et commentez chaque projet selon des critères standardisés.'
    }
  ]

  const tagColors: Record<Role['tagColor'], string> = {
    green: 'bg-moss-light text-moss',
    blue: 'bg-blue-light text-blue',
    amber: 'bg-amber-light text-amber-dark',
    red: 'bg-red-light text-red'
  }

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-[80px]" id="roles">
      <div className="text-center mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink3 mb-2">Pour chaque acteur</div>
        <h2 className="font-syne text-[28px] font-bold text-ink">Une solution adaptée à votre rôle</h2>
        <p className="text-sm text-ink2 mt-2 max-w-md mx-auto">Que vous soyez porteur, incubateur, coach ou jury, ToolBox s&apos;adapte à vos besoins.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role, idx) => (
          <div key={idx} className="group bg-surface border border-border rounded-xl p-6 flex flex-col gap-3 transition-all duration-200 hover:shadow-card-hover hover:border-moss/20">
            <span className={`inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${tagColors[role.tagColor]}`}>
              {role.tag}
            </span>
            <h3 className="text-sm font-semibold text-ink">{role.title}</h3>
            <p className="text-xs text-ink2 leading-relaxed">{role.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
