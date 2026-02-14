import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Builders Performance',
  description: 'Painel administrativo Builders Performance',
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children
}
