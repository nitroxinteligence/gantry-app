"use client"

import { useEffect, type ReactNode } from "react"

import { ProvedorTema } from "@/componentes/tema/provedor-tema"
import { ProvedorToast } from "@/componentes/ui/toaster"
import { AuthGuard } from "@/componentes/layout/auth-guard"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { QueryProvider } from "@/lib/providers/query-provider"
import { initCapacitorPlugins } from "@/lib/capacitor/plugins"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    initCapacitorPlugins()
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        <AuthGuard>
          <ProvedorTema>{children}</ProvedorTema>
        </AuthGuard>
        <ProvedorToast />
      </AuthProvider>
    </QueryProvider>
  )
}
