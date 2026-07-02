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
    green: 'bg-accent-light text-accent',
    blue: 'bg-blue-light text-blue',
    amber: 'bg-amber-light text-amber',
    red: 'bg-red-light text-red'
  }

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-[72px]" id="roles">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-2 mb-8 text-center">
        Pour chaque acteur
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mt-2">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className={`inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${tagColors[role.tagColor]}`}>
              {role.tag}
            </span>
            <h3 className="text-sm font-semibold text-text">{role.title}</h3>
            <p className="text-xs text-text-2 leading-relaxed">{role.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}