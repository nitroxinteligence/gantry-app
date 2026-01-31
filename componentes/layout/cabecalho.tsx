"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronRight, LogOut, Menu, Moon, Search, Star, Sun, UserRound } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback } from "@/componentes/ui/avatar"
import { Botao } from "@/componentes/ui/botao"
import { Entrada } from "@/componentes/ui/entrada"
import {
  MenuSuspenso,
  MenuSuspensoConteudo,
  MenuSuspensoGatilho,
  MenuSuspensoItem,
  MenuSuspensoSeparador,
} from "@/componentes/ui/menu-suspenso"
import { useAuth } from "@/lib/providers/auth-provider"
import { obterBreadcrumbs, obterTituloPagina } from "@/lib/navegacao"
import { DropdownNotificacoes } from "@/componentes/layout/dropdown-notificacoes"
import { cn } from "@/lib/utilidades"
import { useUserLevel } from "@/hooks/useDashboard"

interface CabecalhoProps {
  onToggleSidebar?: () => void
}

export function Cabecalho({ onToggleSidebar }: CabecalhoProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const tituloPagina = obterTituloPagina(pathname)
  const breadcrumbs = obterBreadcrumbs(pathname)
  const temaEscuro = resolvedTheme === "dark"

  const alternarTema = React.useCallback(() => {
    setTheme(temaEscuro ? "light" : "dark")
  }, [temaEscuro, setTheme])

  const { data: userLevel } = useUserLevel()

  const nomeUsuario =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário"
  const iniciaisUsuario = nomeUsuario
    .split(" ")
    .map((parte: string) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const toggleTemaClasses = cn(
    "inline-flex h-5 w-9 items-center rounded-full border border-border p-0.5 transition-colors",
    temaEscuro ? "bg-foreground" : "bg-muted"
  )
  const togglePinoClasses = cn(
    "h-4 w-4 rounded-full bg-background transition-transform",
    temaEscuro ? "translate-x-4" : "translate-x-0"
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Mobile sidebar toggle */}
      <Botao
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Botao>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm lg:flex">
        <Link
          href="/inicio"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Início
        </Link>
        {breadcrumbs
          .filter((b) => b.href !== "/inicio")
          .map((crumb) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground/50"
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">
                {crumb.titulo}
              </span>
            </React.Fragment>
          ))}
        {breadcrumbs.length === 0 && tituloPagina ? (
          <>
            <ChevronRight
              className="h-3.5 w-3.5 text-muted-foreground/50"
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{tituloPagina}</span>
          </>
        ) : null}
      </nav>

      {/* Mobile title */}
      <h1 className="text-sm font-semibold lg:hidden">
        {tituloPagina || "Início"}
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search bar */}
      <div className="relative hidden w-64 lg:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Entrada
          type="search"
          placeholder="Buscar..."
          className="h-9 pl-9 text-sm"
          aria-label="Buscar no app"
        />
      </div>

      {/* XP Level Badge */}
      {userLevel && (
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5 rounded-full bg-[#F5F5F5] px-3 py-1 dark:bg-[#1E1E1E]">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Lv.{userLevel.nivel}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {userLevel.percentual}%
              </span>
            </div>
            <div className="h-0.5 w-full max-w-[80px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${userLevel.percentual}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <DropdownNotificacoes />

      {/* User avatar with dropdown */}
      <MenuSuspenso>
        <MenuSuspensoGatilho asChild>
          <Botao
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            aria-label="Menu do usuario"
          >
            <Avatar tamanho="sm">
              <AvatarFallback>{iniciaisUsuario}</AvatarFallback>
            </Avatar>
          </Botao>
        </MenuSuspensoGatilho>
        <MenuSuspensoConteudo
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-56"
        >
          <MenuSuspensoItem className="cursor-pointer gap-2 font-medium">
            <Bell
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            Notificações
          </MenuSuspensoItem>
          <MenuSuspensoItem
            onSelect={(event) => {
              event.preventDefault()
              alternarTema()
            }}
            className="flex cursor-pointer items-center justify-between font-medium"
          >
            <span className="flex items-center gap-2">
              {temaEscuro ? (
                <Moon
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Sun
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              Tema
            </span>
            <span aria-hidden="true" className={toggleTemaClasses}>
              <span className={togglePinoClasses} />
            </span>
          </MenuSuspensoItem>
          <MenuSuspensoItem
            asChild
            className="cursor-pointer gap-2 font-medium"
          >
            <Link
              href="/perfil"
              className="flex w-full items-center gap-2"
              aria-label="Ir para perfil do usuário"
            >
              <UserRound
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              Perfil
            </Link>
          </MenuSuspensoItem>
          <MenuSuspensoSeparador />
          <MenuSuspensoItem
            onSelect={signOut}
            className="cursor-pointer gap-2 font-medium text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </MenuSuspensoItem>
        </MenuSuspensoConteudo>
      </MenuSuspenso>
    </header>
  )
}
