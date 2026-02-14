"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

import { useAuth } from "@/lib/providers/auth-provider"

const PROTECTED_ROUTES = [
  "/foco",
  "/tarefas",
  "/agenda",
  "/habitos",
  "/onboarding",
  "/inicio",
  "/perfil",
  "/assistente",
  "/cursos",
]

const AUTH_ROUTES = ["/entrar", "/criar-conta"]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user && isProtectedRoute(pathname)) {
      router.replace(`/entrar?redirectTo=${encodeURIComponent(pathname)}`)
      return
    }

    if (user && isAuthRoute(pathname)) {
      router.replace("/foco")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user && isProtectedRoute(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user && isAuthRoute(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
