'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  isLoggedIn: boolean
  onLogin: () => void
  onLogout: () => void
}

export default function Navbar({ isLoggedIn, onLogin, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/login')
    closeMobileMenu()
  }

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/register')
    closeMobileMenu()
  }

  const handleLogout = () => {
    onLogout()
    closeMobileMenu()
  }

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[64px] flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
          scrolled ? 'glass border-b border-border' : 'bg-transparent'
        }`}
      >
        <a href="/" className="font-syne text-lg font-bold flex items-center gap-2 no-underline">
          <svg viewBox="0 0 120 30" className="h-6 w-auto">
            <text x="0" y="20" fontFamily="Syne, sans-serif" fontSize="20" fontWeight="700" letterSpacing="0.5">
              <tspan fill={scrolled ? '#1D9E75' : '#a0e0b8'}>Project</tspan>
              <tspan fill={scrolled ? '#c9a84c' : '#c9a84c'}>Struct</tspan>
            </text>
          </svg>
        </a>

        <div className="hidden md:flex items-center gap-1">
          <a href="#features" className="text-sm font-medium text-ink2 px-3 py-1.5 rounded-lg hover:bg-moss/5 hover:text-ink transition-all duration-150">
            Fonctionnalités
          </a>
          <a href="#roles" className="text-sm font-medium text-ink2 px-3 py-1.5 rounded-lg hover:bg-moss/5 hover:text-ink transition-all duration-150">
            Pour qui
          </a>
          <div className="w-px h-5 bg-border mx-2" />
          {!isLoggedIn ? (
            <>
              <button onClick={handleLogin} className="text-sm font-medium px-4 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-cream transition-all duration-150">
                Connexion
              </button>
              <button onClick={handleRegister} className="text-sm font-medium px-4 py-1.5 rounded-lg bg-moss text-white hover:bg-moss-dark transition-all duration-150 shadow-[0_2px_8px_rgba(29,158,117,0.2)]">
                Commencer →
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-moss-light text-moss text-xs font-semibold flex items-center justify-center">
                AS
              </div>
              <span className="text-sm font-medium text-ink hidden sm:inline">Ahmed S.</span>
              <button onClick={handleLogout} className="text-xs font-medium text-red bg-transparent border border-transparent px-2.5 py-1.5 rounded-lg hover:bg-red-light hover:border-red/20 transition-all duration-150">
                Déconnexion
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer focus:outline-none"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`w-5 h-0.5 block rounded-sm transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2 bg-ink' : 'bg-ink2'}`} />
          <span className={`w-5 h-0.5 block rounded-sm transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'bg-ink2'}`} />
          <span className={`w-5 h-0.5 block rounded-sm transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2 bg-ink' : 'bg-ink2'}`} />
        </button>
      </nav>

      <div className={`md:hidden fixed inset-x-0 top-[64px] z-40 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10" onClick={closeMobileMenu} />
        <div className="bg-surface border-b border-border flex flex-col gap-1 p-4 shadow-elevated">
          <a href="#features" onClick={closeMobileMenu} className="text-base font-medium text-ink2 w-full text-left px-3 py-3 rounded-lg hover:bg-moss/5 transition-colors">
            Fonctionnalités
          </a>
          <a href="#roles" onClick={closeMobileMenu} className="text-base font-medium text-ink2 w-full text-left px-3 py-3 rounded-lg hover:bg-moss/5 transition-colors">
            Pour qui
          </a>
          <div className="h-px bg-border my-2" />
          {!isLoggedIn ? (
            <>
              <button onClick={handleLogin} className="text-base font-medium w-full text-center px-4 py-3 rounded-lg border border-border bg-surface text-ink hover:bg-cream transition-colors">
                Connexion
              </button>
              <button onClick={handleRegister} className="text-base font-medium w-full text-center px-4 py-3 rounded-lg bg-moss text-white hover:bg-moss-dark transition-colors">
                Commencer →
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-moss-light text-moss text-sm font-semibold flex items-center justify-center">
                  AS
                </div>
                <span className="text-base font-medium text-ink">Ahmed S.</span>
              </div>
              <button onClick={handleLogout} className="text-base font-medium text-red bg-transparent border border-red-light px-4 py-3 rounded-lg hover:bg-red-light transition-colors">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
