'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  isLoggedIn: boolean
  onLogin: () => void
  onLogout: () => void
}

export default function Navbar({ isLoggedIn, onLogin, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const router = useRouter()

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    router.push('/login')
    closeMobileMenu()
  }

  const handleRegister = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
      <nav className="bg-surface border-b border-border px-6 h-[60px] flex items-center justify-between sticky top-0 z-100 relative">
        <a href="/" className="font-syne text-lg font-bold text-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
          ProjectStruct
        </a>

        {/* Desktop navigation */}
        <div className="hidden sm:flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <a href="#features" className="text-sm font-medium text-text-2 px-3 py-1.5 rounded-md hover:bg-bg hover:text-text transition-all duration-150">
                Fonctionnalités
              </a>
              <a href="#roles" className="text-sm font-medium text-text-2 px-3 py-1.5 rounded-md hover:bg-bg hover:text-text transition-all duration-150">
                Pour qui
              </a>
             <a
  href="/login"
  onClick={(e) => {
    e.preventDefault()
    router.push('/login')
    closeMobileMenu()
  }}
  className="text-sm font-medium px-4 py-1.5 rounded-md border border-border bg-surface text-text hover:bg-bg transition-all duration-150 cursor-pointer"
> Connecter </a>
              <a
                href="/register"
                onClick={handleRegister}
                className="text-sm font-medium px-4 py-1.5 rounded-md border border-accent bg-accent text-white hover:bg-accent-mid hover:border-accent-mid transition-all duration-150"
              >
                Commencer →
              </a>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-full bg-accent-light text-accent text-xs font-semibold flex items-center justify-center">
                AS
              </div>
              <span className="text-sm font-medium text-text">Ahmed S.</span>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-red bg-transparent border border-transparent px-2.5 py-1.5 rounded-md hover:bg-red-light hover:border-red-200 transition-all duration-150"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>

        {/* Hamburger button */}
        <button
          onClick={toggleMobileMenu}
          className="sm:hidden flex flex-col gap-1 p-1.5 bg-transparent border-none cursor-pointer"
          aria-label="Menu"
        >
          <span className="w-[18px] h-[1.5px] bg-text block rounded-sm transition-all"></span>
          <span className="w-[18px] h-[1.5px] bg-text block rounded-sm transition-all"></span>
          <span className="w-[18px] h-[1.5px] bg-text block rounded-sm transition-all"></span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } sm:hidden absolute top-[60px] left-0 right-0 bg-surface border-b border-border flex-col gap-1.5 p-4 z-99`}
      >
        <a href="#features" onClick={closeMobileMenu} className="text-sm font-medium text-text-2 w-full text-left px-3 py-2.5 rounded-md hover:bg-bg">
          Fonctionnalités
        </a>
        <a href="#roles" onClick={closeMobileMenu} className="text-sm font-medium text-text-2 w-full text-left px-3 py-2.5 rounded-md hover:bg-bg">
          Pour qui
        </a>
        <div className="h-px bg-border my-1"></div>
        {!isLoggedIn ? (
          <>
            <button
              onClick={handleLogin}
              className="text-sm font-medium w-full text-center px-4 py-2.5 rounded-md border border-border bg-surface text-text hover:bg-bg transition-all duration-150"
            >
              Connexion
            </button>
            <a
              href="/register"
              onClick={handleRegister}
              className="text-sm font-medium w-full text-center px-4 py-2.5 rounded-md border border-accent bg-accent text-white hover:bg-accent-mid transition-all duration-150"
            >
              Commencer →
            </a>
          </>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-full bg-accent-light text-accent text-xs font-semibold flex items-center justify-center">
                AS
              </div>
              <span className="text-sm font-medium text-text">Ahmed S.</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red bg-transparent border border-red-light px-3 py-2 rounded-md hover:bg-red-light transition-all duration-150"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </>
  )
}