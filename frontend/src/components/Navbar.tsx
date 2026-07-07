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
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
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
      <nav className="bg-surface border-b border-border px-4 sm:px-6 h-[60px] flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="font-syne text-lg font-bold text-text flex items-center gap-2 no-underline">
          <svg viewBox="0 0 120 30" className="h-6 w-auto">
            <text x="0" y="20" fontFamily="Syne, sans-serif" fontSize="20" fontWeight="700" letterSpacing="0.5">
              <tspan fill="#a0e0b8">Project</tspan>
              <tspan fill="#c9a84c">Struct</tspan>
            </text>
          </svg>
        </a>

        <div className="hidden md:flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <a href="#features" className="text-sm font-medium text-text-2 px-3 py-1.5 rounded-md hover:bg-bg hover:text-text transition-all duration-150">
                Fonctionnalités
              </a>
              <a href="#roles" className="text-sm font-medium text-text-2 px-3 py-1.5 rounded-md hover:bg-bg hover:text-text transition-all duration-150">
                Pour qui
              </a>
              <a href="/login" onClick={handleLogin} className="text-sm font-medium px-4 py-1.5 rounded-md border border-border bg-surface text-text hover:bg-bg transition-all duration-150">
                Connexion
              </a>
              <a href="/register" onClick={handleRegister} className="text-sm font-medium px-4 py-1.5 rounded-md border border-accent bg-accent text-white hover:bg-accent-mid hover:border-accent-mid transition-all duration-150">
                Commencer →
              </a>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent-light text-accent text-xs font-semibold flex items-center justify-center">
                AS
              </div>
              <span className="text-sm font-medium text-text hidden sm:inline">Ahmed S.</span>
              <button onClick={handleLogout} className="text-xs font-medium text-red bg-transparent border border-transparent px-2.5 py-1.5 rounded-md hover:bg-red-light hover:border-red-200 transition-all duration-150">
                Déconnexion
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer focus:outline-none"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`w-5 h-0.5 bg-text block rounded-sm transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-text block rounded-sm transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-text block rounded-sm transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      <div className={`md:hidden fixed inset-x-0 top-[60px] z-40 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10" onClick={closeMobileMenu} />
        <div className="bg-surface border-b border-border flex flex-col gap-1 p-4 shadow-lg">
          <a href="#features" onClick={closeMobileMenu} className="text-base font-medium text-text-2 w-full text-left px-3 py-3 rounded-md hover:bg-bg active:bg-bg transition-colors">
            Fonctionnalités
          </a>
          <a href="#roles" onClick={closeMobileMenu} className="text-base font-medium text-text-2 w-full text-left px-3 py-3 rounded-md hover:bg-bg active:bg-bg transition-colors">
            Pour qui
          </a>
          <div className="h-px bg-border my-2" />
          {!isLoggedIn ? (
            <>
              <button onClick={handleLogin} className="text-base font-medium w-full text-center px-4 py-3 rounded-md border border-border bg-surface text-text hover:bg-bg active:bg-bg transition-colors">
                Connexion
              </button>
              <a href="/register" onClick={handleRegister} className="text-base font-medium w-full text-center px-4 py-3 rounded-md border border-accent bg-accent text-white hover:bg-accent-mid active:bg-accent-mid transition-colors">
                Commencer →
              </a>
            </>
          ) : (
            <div className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-light text-accent text-sm font-semibold flex items-center justify-center">
                  AS
                </div>
                <span className="text-base font-medium text-text">Ahmed S.</span>
              </div>
              <button onClick={handleLogout} className="text-base font-medium text-red bg-transparent border border-red-light px-4 py-3 rounded-md hover:bg-red-light active:bg-red-light transition-colors">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}