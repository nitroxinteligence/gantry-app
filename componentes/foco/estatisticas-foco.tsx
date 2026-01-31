"use client"

import { Clock, Target, TrendingUp, Zap } from "lucide-react"
import { motion } from "framer-motion"

import { Cartao, CartaoConteudo } from "@/componentes/ui/cartao"
import { variantesEntrada } from "@/lib/animacoes"
import type { FocusStatsDisplay } from "@/app/(protegido)/foco/types"

interface EstatisticasFocoProps {
  estatisticas: FocusStatsDisplay
}

const stats = [
  {
    key: "sessions",
    icon: Target,
    label: "Sessoes totais",
    getValue: (e: FocusStatsDisplay) => `${e.totalSessions}`,
  },
  {
    key: "time",
    icon: Clock,
    label: "Tempo total",
    getValue: (e: FocusStatsDisplay) => `${e.totalHours}h ${e.totalMinutes}m`,
  },
  {
    key: "xp",
    icon: Zap,
    label: "XP ganho",
    getValue: (e: FocusStatsDisplay) => `${e.totalXp}`,
  },
  {
    key: "avg",
    icon: TrendingUp,
    label: "Media por sessao",
    getValue: (e: FocusStatsDisplay) => `${e.averageMinutes}min`,
  },
] as const

export function EstatisticasFoco({ estatisticas }: EstatisticasFocoProps) {
  return (
    <motion.section
      variants={variantesEntrada}
      initial="oculto"
      animate="visivel"
      className="grid gap-4 grid-cols-2 md:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icone = stat.icon
        return (
          <Cartao key={stat.key}>
            <CartaoConteudo className="flex items-center gap-3 p-4">
              <Icone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">
                  {stat.getValue(estatisticas)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CartaoConteudo>
          </Cartao>
        )
      })}
    </motion.section>
  )
}
