"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { BottomTabBar } from "@/componentes/layout/bottom-tab-bar"
import { Cabecalho } from "@/componentes/layout/cabecalho"
import { MobileSidebar } from "@/componentes/layout/mobile-sidebar"
import { Sidebar } from "@/componentes/layout/sidebar"
import { cn } from "@/lib/utilidades"

const ROTAS_SEM_SHELL = ["/assistente"]

export default function LayoutProtegido({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarAberta, setSidebarAberta] = React.useState(false)
  const [mobileSidebarAberta, setMobileSidebarAberta] = React.useState(false)

  const ocultarShell = ROTAS_SEM_SHELL.includes(pathname)

  const alternarSidebar = React.useCallback(() => {
    setSidebarAberta((anterior) => !anterior)
  }, [])

  const abrirMobileSidebar = React.useCallback(() => {
    setMobileSidebarAberta(true)
  }, [])

  if (ocultarShell) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main id="main-content" className="flex min-h-screen flex-col">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />
      <MobileSidebar
        open={mobileSidebarAberta}
        onOpenChange={setMobileSidebarAberta}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col pb-16 transition-[padding] duration-300 lg:pb-0",
          sidebarAberta ? "lg:pl-56" : "lg:pl-16"
        )}
      >
        <Cabecalho
          onToggleSidebar={alternarSidebar}
          onOpenMobileSidebar={abrirMobileSidebar}
        />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
