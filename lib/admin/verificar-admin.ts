import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

interface AdminVerification {
  authenticated: boolean
  isAdmin: boolean
  userId: string | null
  error?: string
}

export async function verificarAdmin(): Promise<AdminVerification> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authenticated: false, isAdmin: false, userId: null, error: 'Nao autenticado' }
  }

  const adminClient = createAdminClient()
  const { data: adminData, error: adminError } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminData) {
    return { authenticated: true, isAdmin: false, userId: user.id, error: 'Nao eh admin' }
  }

  return { authenticated: true, isAdmin: true, userId: user.id }
}
