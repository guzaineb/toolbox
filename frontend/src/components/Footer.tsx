export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-[1000px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 100 24" className="h-5 w-auto">
            <text x="0" y="16" fontFamily="Syne, sans-serif" fontSize="16" fontWeight="700">
              <tspan fill="#1D9E75">Tool</tspan>
              <tspan fill="#c9a84c">Box</tspan>
            </text>
          </svg>
          <span className="text-xs text-ink3">© 2025 ToolBox</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink3">
          <a href="#features" className="hover:text-ink transition-colors">Fonctionnalités</a>
          <a href="#roles" className="hover:text-ink transition-colors">Pour qui</a>
          <span className="text-ink4">·</span>
          <span>Tous droits réservés</span>
        </div>
      </div>
    </footer>
  )
}
