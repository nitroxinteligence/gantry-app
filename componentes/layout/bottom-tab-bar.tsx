"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal, UserRound, X } from "lucide-react"
import * as DialogoPrimitivo from "@radix-ui/react-dialog"

import { cn } from "@/lib/utilidades"
import {
  tabsPrincipaisMobile,
  rotasSecundariasMobile,
  rotaAtiva,
} from "@/lib/navegacao"

export function BottomTabBar() {
  const pathname = usePathname()
  const [drawerAberto, setDrawerAberto] = React.useState(false)

  const maisAtivo =
    rotasSecundariasMobile.some((r) => rotaAtiva(pathname, r.href)) ||
    rotaAtiva(pathname, "/perfil")

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
        aria-label="Navegação principal"
      >
        <div className="flex items-stretch justify-around">
          {tabsPrincipaisMobile.map((tab) => {
            const ativo = rotaAtiva(pathname, tab.href)
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors active:scale-[0.96]",
                  ativo
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <tab.icone className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{tab.titulo}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setDrawerAberto(true)}
            aria-label="Mais opções"
            className={cn(
              "flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors active:scale-[0.96]",
              maisAtivo
                ? "text-primary"
                : "text-muted-foreground active:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <DialogoPrimitivo.Root
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
      >
        <DialogoPrimitivo.Portal>
          <DialogoPrimitivo.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
          <DialogoPrimitivo.Content
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom lg:hidden"
            aria-describedby={undefined}
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-muted" />
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <DialogoPrimitivo.Title className="text-sm font-semibold">
                Mais opções
              </DialogoPrimitivo.Title>
              <DialogoPrimitivo.Close className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </DialogoPrimitivo.Close>
            </div>
            <div className="flex flex-col gap-1 px-3 pb-5">
              {rotasSecundariasMobile.map((rota) => {
                const ativo = rotaAtiva(pathname, rota.href)
                return (
                  <Link
                    key={rota.id}
                    href={rota.href}
                    onClick={() => setDrawerAberto(false)}
                    aria-current={ativo ? "page" : undefined}
                    className={cn(
                      "flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.98]",
                      ativo
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-secondary-foreground"
                    )}
                  >
                    <rota.icone
                      className="h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                    {rota.titulo}
                  </Link>
                )
              })}
              <Link
                href="/perfil"
                onClick={() => setDrawerAberto(false)}
                aria-current={
                  rotaAtiva(pathname, "/perfil") ? "page" : undefined
                }
                className={cn(
                  "flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.98]",
                  rotaAtiva(pathname, "/perfil")
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-secondary-foreground"
                )}
              >
                <UserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
                Perfil
              </Link>
            </div>
          </DialogoPrimitivo.Content>
        </DialogoPrimitivo.Portal>
      </DialogoPrimitivo.Root>
    </>
  )
}
