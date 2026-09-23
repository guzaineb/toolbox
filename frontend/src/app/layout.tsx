import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'ToolBox - Plateforme de structuration de projets entrepreneuriaux',
  description: 'De l\'idée au projet structuré et finançable. ProjectStruct guide les porteurs de projet étape par étape.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}