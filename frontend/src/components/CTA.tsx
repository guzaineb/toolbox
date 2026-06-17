export default function CTA() {
  return (
    <div className="relative mx-6 my-16 py-14 px-8 text-center rounded-2xl overflow-hidden bg-gradient-to-br from-moss to-moss-dark shadow-elevated">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.03] rounded-full translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10">
        <div className="font-syne text-[24px] sm:text-[28px] font-bold text-white mb-3">
          Prêt à structurer votre projet ?
        </div>
        <div className="text-sm text-white/70 mb-8 max-w-sm mx-auto">
          Rejoignez l&apos;infrastructure digitale de référence en Tunisie.
        </div>
        <a
          href="/register"
          className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl bg-white text-moss hover:bg-gray-50 transition-all duration-200 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
        >
          Créer un compte gratuit
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </div>
  )
}
