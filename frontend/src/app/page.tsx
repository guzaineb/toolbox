'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import Features from '@/components/Features'
import Roles from '@/components/Roles'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  const handleLogin = () => setIsLoggedIn(true)
  const handleLogout = () => setIsLoggedIn(false)

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.hash && anchor.hash.startsWith('#') && anchor.origin === window.location.origin) {
        const element = document.querySelector(anchor.hash)
        if (element) {
          e.preventDefault()
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return (
    <div className="relative">
      <h2 className="sr-only">ProjectStruct – Plateforme de structuration de projets entrepreneuriaux</h2>
      
      <Navbar 
        isLoggedIn={isLoggedIn} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
      />
      
      <Hero />
      <Stats />
      
      <div className="h-px bg-border mx-6 mb-14"></div>
      
      <Features />
      
      <div className="h-px bg-border mx-6 mb-14"></div>
      
      <Roles />
      
      <CTA />
      <Footer />
    </div>
  )
}