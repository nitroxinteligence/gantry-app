"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bot, Send } from "lucide-react"

interface PropsCartaoBriefing {
  nomeUsuario: string
  mensagem: string
}

export function CartaoBriefing({ nomeUsuario, mensagem }: PropsCartaoBriefing) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="font-titulo text-sm font-semibold text-foreground">
            Builder Assistant
          </h3>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Briefing de {nomeUsuario}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{mensagem}&rdquo;
      </p>

      <Link href="/assistente" className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/60">
        <span className="flex-1">Pergunte algo ao Assistant...</span>
        <Send className="h-4 w-4 shrink-0" />
      </Link>
    </motion.div>
  )
}
