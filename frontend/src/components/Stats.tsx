export default function Stats() {
  return (
    <div className="max-w-[760px] mx-auto mb-16 px-6">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-card-hover hover:border-moss/20">
          <div className="font-syne text-[32px] font-bold text-ink leading-none">3</div>
          <div className="text-xs text-ink2 mt-2">Types d&apos;acteurs</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-card-hover hover:border-moss/20">
          <div className="font-syne text-[32px] font-bold text-gradient leading-none">IA</div>
          <div className="text-xs text-ink2 mt-2">Assistance intégrée</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-card-hover hover:border-moss/20">
          <div className="font-syne text-[32px] font-bold text-ink leading-none">100%</div>
          <div className="text-xs text-ink2 mt-2">Autonomie porteur</div>
        </div>
      </div>
    </div>
  )
}
