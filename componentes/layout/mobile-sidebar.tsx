"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Moon, Sun, X } from "lucide-react"
import * as DialogoPrimitivo from "@radix-ui/react-dialog"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utilidades"
import { useAuth } from "@/lib/providers/auth-provider"
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar"
import { marcaSidebar, secoesMenu, rotaAtiva } from "@/lib/navegacao"

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const temaEscuro = resolvedTheme === "dark"

  const nomeUsuario =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário"
  const iniciaisUsuario = nomeUsuario
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DialogoPrimitivo.Root open={open} onOpenChange={onOpenChange}>
      <DialogoPrimitivo.Portal>
        <DialogoPrimitivo.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogoPrimitivo.Content
          className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-sidebar data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <marcaSidebar.icone className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/60">
                  Builders
                </p>
                <p className="font-titulo text-sm font-semibold text-sidebar-foreground">
                  Performance
                </p>
              </div>
            </div>
            <DialogoPrimitivo.Close className="flex h-11 w-11 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent">
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar menu</span>
            </DialogoPrimitivo.Close>
          </div>

          {/* User info */}
          <div className="border-b border-sidebar-border px-5 py-4">
            <div className="flex items-center gap-3">
              <Avatar tamanho="md">
                <AvatarFallback>{iniciaisUsuario}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {nomeUsuario}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu principal">
            <div className="flex flex-col gap-6">
              {secoesMenu.map((secao) => (
                <div key={secao.id} className="flex flex-col gap-1">
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/50">
                    {secao.titulo}
                  </p>
                  {secao.itens.map((item) => {
                    const ativo = rotaAtiva(pathname, item.href)
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        aria-current={ativo ? "page" : undefined}
                        className={cn(
                          "flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.98]",
                          ativo
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icone className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.titulo}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer actions */}
          <div className="border-t border-sidebar-border px-3 py-4">
            <button
              type="button"
              onClick={() => setTheme(temaEscuro ? "light" : "dark")}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/5 active:scale-[0.98]"
            >
              {temaEscuro ? (
                <Sun className="h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
              {temaEscuro ? "Modo claro" : "Modo escuro"}
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                signOut()
              }}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 active:scale-[0.98]"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              Sair
            </button>
          </div>
        </DialogoPrimitivo.Content>
      </DialogoPrimitivo.Portal>
    </DialogoPrimitivo.Root>
  )
}
