import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

const ADMIN_PROTECTED_ROUTES = ["/admin/dashboard", "/admin/cursos", "/admin/usuarios", "/admin/notificacoes"]

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

function isAdminRoute(pathname: string): boolean {
  return ADMIN_PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && isAdminRoute(pathname)) {
    return NextResponse.redirect(new URL("/admin/entrar", request.url))
  }

  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = new URL("/entrar", request.url)
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/foco", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/foco/:path*",
    "/tarefas/:path*",
    "/agenda/:path*",
    "/habitos/:path*",
    "/onboarding/:path*",
    "/inicio/:path*",
    "/perfil/:path*",
    "/assistente/:path*",
    "/cursos/:path*",
    "/entrar/:path*",
    "/criar-conta/:path*",
    "/admin/:path*",
  ],
}
