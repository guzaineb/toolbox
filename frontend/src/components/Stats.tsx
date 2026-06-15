export default function Stats() {
  return (
    <div className="max-w-[760px] mx-auto mb-14 px-6">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="font-syne text-[28px] font-bold text-text">4</div>
          <div className="text-xs text-text-2 mt-1">Types d'acteurs</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="font-syne text-[28px] font-bold text-accent">IA</div>
          <div className="text-xs text-text-2 mt-1">Assistance intégrée</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="font-syne text-[28px] font-bold text-text">100%</div>
          <div className="text-xs text-text-2 mt-1">Autonomie porteur</div>
        </div>
      </div>
    </div>
  )
}