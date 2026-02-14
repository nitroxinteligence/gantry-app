'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/providers/auth-provider'
import { useAdminAuth } from '@/hooks/admin/useAdminAuth'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Bell,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/cursos', label: 'Cursos', icon: GraduationCap },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/notificacoes', label: 'Notificacoes', icon: Bell },
]

function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAdmin, isLoading, isError } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (isError || !isAdmin) {
    router.push('/admin/entrar')
    return null
  }

  return <>{children}</>
}

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/entrar')
  }

  return (
    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-zinc-500">Builders Performance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-violet-600/10 text-violet-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

function AdminPainelLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-zinc-950">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
      <Toaster position="top-right" theme="dark" richColors />
    </AdminGuard>
  )
}

export default function AdminPainelRootLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminPainelLayout>{children}</AdminPainelLayout>
      </AuthProvider>
    </QueryClientProvider>
  )
}
