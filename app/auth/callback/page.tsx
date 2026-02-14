"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const next = searchParams.get("next") ?? "/foco"

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(next)
          return
        }
        setErro(error.message)
      } else {
        setErro("Código de autenticação não encontrado")
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-destructive">{erro}</p>
          <button
            type="button"
            onClick={() => router.replace("/entrar")}
            className="mt-4 text-sm text-primary underline"
          >
            Voltar para login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
