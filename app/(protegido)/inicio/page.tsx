"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarCheck,
  Check,
  Circle,
  Flame,
  ListTodo,
  Moon,
  Sparkles,
  Star,
  Sun,
  Timer,
  WandSparkles,
  Zap,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import { Progresso } from "@/componentes/ui/progresso"
import {
  Dialogo,
  DialogoConteudo,
  DialogoTitulo,
} from "@/componentes/ui/dialogo"
import { EsqueletoCartao, EsqueletoEstatistica } from "@/componentes/ui/esqueleto"
import { AnimacaoPagina, SecaoAnimada, DivAnimada } from "@/componentes/ui/animacoes"
import { ErrorBoundary } from "@/componentes/erro"
import { cn } from "@/lib/utilidades"
import { useAuth } from "@/lib/providers/auth-provider"

import { useDashboardData } from "@/hooks/useDashboard"
import { CartaoKpi } from "@/componentes/inicio/cartao-kpi"
import { GraficoAtividade } from "@/componentes/inicio/grafico-atividade"
import { SecaoMissoesDiarias } from "@/componentes/inicio/secao-missoes-diarias"
import { SecaoAgendaDia } from "@/componentes/inicio/secao-agenda-dia"
import { SecaoConquistas } from "@/componentes/inicio/secao-conquistas"
import { CartaoBriefing } from "@/componentes/inicio/cartao-briefing"
import { ProgressoSemanal } from "@/componentes/inicio/progresso-semanal"
import {
  dadosAtividadeSemanal,
  eventosHoje,
  conquistasRecentes,
  mensagemBriefing,
  tendencias,
} from "./dados-dashboard"
import AcoesRapidasInicio from "./acoes-rapidas"

function ConteudoPaginaInicio() {
  const { user } = useAuth()
  const {
    userLevel,
    dailyStats,
    progressoSemanal,
    missoesDiarias,
    isLoading: carregando,
  } = useDashboardData()

  const nomeUsuario = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"
  const primeiroNome = nomeUsuario.split(" ")[0] ?? nomeUsuario
  const agora = new Date()
  const horaAtual = agora.getHours()

  const saudacao =
    horaAtual < 12
      ? `Bom dia, ${primeiroNome}`
      : horaAtual < 18
        ? `Boa tarde, ${primeiroNome}`
        : `Boa noite, ${primeiroNome}`

  const saudacaoDailyStart =
    horaAtual < 12
      ? `Bom dia, ${primeiroNome}!`
      : horaAtual < 18
        ? `Boa tarde, ${primeiroNome}!`
        : `Boa noite, ${primeiroNome}!`

  const IconeSaudacao = horaAtual >= 6 && horaAtual < 18 ? Sun : Moon
  const dataHoraFormatada = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(agora)

  const [dailyStartAberto, setDailyStartAberto] = React.useState(false)

  const questsConcluidas = missoesDiarias.filter((m) => m.concluida).length

  const estatisticasDailyStart = React.useMemo(() => [
    { id: "streak", label: "Streak", valor: `${userLevel.streakAtual} dias`, icone: Flame },
    { id: "energia", label: "Energia", valor: "100%", icone: Zap },
    {
      id: "level",
      label: "Level",
      valor: String(userLevel.nivel),
      icone: Star,
    },
  ], [userLevel.streakAtual, userLevel.nivel])

  React.useEffect(() => {
    const chave = "daily-start-ultima-exibicao"
    const agora = Date.now()
    const ultimaExibicao = Number(localStorage.getItem(chave) ?? 0)

    if (!ultimaExibicao || agora - ultimaExibicao >= 24 * 60 * 60 * 1000) {
      setDailyStartAberto(true)
    }
  }, [])

  const atualizarAberturaDailyStart = React.useCallback((aberto: boolean) => {
    setDailyStartAberto(aberto)

    if (!aberto) {
      localStorage.setItem("daily-start-ultima-exibicao", String(Date.now()))
    }
  }, [])

  const energiaPercentual = 100

  return (
    <>
      {/* Daily Start Dialog */}
      <Dialogo open={dailyStartAberto} onOpenChange={atualizarAberturaDailyStart}>
        <DialogoConteudo className="max-w-4xl rounded-2xl border-border p-6" aria-describedby="daily-start-description">
          <div className="space-y-5">
            <div className="space-y-2">
              <DialogoTitulo className="font-titulo text-xl font-semibold text-foreground sm:text-2xl">
                {saudacaoDailyStart}
              </DialogoTitulo>
            </div>

            <div className="rounded-2xl border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] p-5" id="daily-start-description">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <WandSparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Builder Assistant
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                &ldquo;{mensagemBriefing}&rdquo;
              </p>
              <Botao asChild variant="secondary" className="mt-4">
                <Link href="/assistente" aria-label="Falar com o Builder Assistant">Falar com Assistant</Link>
              </Botao>
            </div>

            <div className="grid gap-3 sm:grid-cols-3" role="list" aria-label="Estatisticas do dia">
              {estatisticasDailyStart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] p-4"
                  role="listitem"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                    <item.icone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="font-titulo text-xl font-semibold">
                    {item.valor}
                  </p>
                  {item.id === "level" ? (
                    <div className="space-y-1">
                      <Progresso value={userLevel.percentual} aria-label={`Nivel ${userLevel.nivel}: ${userLevel.percentual}% completo`} />
                      <span className="text-[11px] text-muted-foreground">
                        {userLevel.percentual}% concluido
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Missoes diarias
                </div>
                <span className="text-xs text-muted-foreground" aria-label={`${questsConcluidas} de ${missoesDiarias.length} missoes concluidas`}>
                  {questsConcluidas}/{missoesDiarias.length}
                </span>
              </div>
              <div className="mt-4 space-y-3" role="list" aria-label="Lista de missoes diarias">
                {missoesDiarias.map((missao) => (
                  <div key={missao.id} className="flex items-center justify-between text-sm" role="listitem">
                    <span
                      className={cn(
                        "flex items-center gap-2",
                        missao.concluida ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <span className="sr-only">{missao.concluida ? "Concluida:" : "Pendente:"}</span>
                      {missao.concluida ? (
                        <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      {missao.texto}
                    </span>
                    <span className="text-muted-foreground">{missao.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Botao asChild variant="outline" className="gap-2">
                <Link href="/tarefas" aria-label="Ver lista de tarefas">
                  <ListTodo className="h-4 w-4" aria-hidden="true" />
                  Tarefas
                </Link>
              </Botao>
              <Botao asChild className="gap-2">
                <Link href="/foco" aria-label="Iniciar sessao de foco">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  Iniciar foco
                </Link>
              </Botao>
            </div>
          </div>
        </DialogoConteudo>
      </Dialogo>

      {/* Main Dashboard Content */}
      <AnimacaoPagina className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8" role="main" aria-label="Conteudo principal do painel">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">

          {/* Header: Greeting */}
          <SecaoAnimada className="space-y-1" aria-labelledby="saudacao-titulo">
            <div className="flex items-center gap-3">
              <IconeSaudacao className="h-5 w-5 text-primary" aria-hidden="true" />
              <h1 id="saudacao-titulo" className="font-titulo text-2xl font-bold text-foreground">
                {saudacao}
              </h1>
            </div>
            <p className="pl-8 text-sm capitalize text-muted-foreground">
              {dataHoraFormatada}
            </p>
          </SecaoAnimada>

          {/* Level Progress Bar */}
          {carregando ? (
            <DivAnimada className="h-20 animate-pulse rounded-2xl bg-muted" />
          ) : (
            <SecaoAnimada
              className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-5"
              aria-label="Progresso de nivel"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Star className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-titulo text-sm font-semibold text-foreground">
                      LEVEL {userLevel.nivel} — {userLevel.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userLevel.xpAtual} / {userLevel.xpTotal} XP para Level {userLevel.nivel + 1}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {userLevel.percentual}%
                </span>
              </div>
              <div className="mt-3">
                <Progresso value={userLevel.percentual} aria-label={`Progresso para o proximo nivel: ${userLevel.percentual}%`} />
              </div>
            </SecaoAnimada>
          )}

          {/* Builder Assistant */}
          {carregando ? (
            <DivAnimada className="h-36 animate-pulse rounded-2xl bg-muted" />
          ) : (
            <SecaoAnimada>
              <CartaoBriefing
                nomeUsuario={primeiroNome}
                mensagem={mensagemBriefing}
              />
            </SecaoAnimada>
          )}

          {/* KPI Cards Row */}
          <SecaoAnimada className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores de desempenho">
            {carregando ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <EsqueletoEstatistica key={i} />
                ))}
              </>
            ) : (
              <>
                <CartaoKpi
                  titulo="XP Total"
                  valor={`${userLevel.xpAtual}`}
                  label={`Level ${userLevel.nivel}`}
                  icone={Sparkles}
                  corIcone="bg-primary/10 text-primary"
                  tendencia={tendencias.xp}
                  progresso={{
                    valor: userLevel.percentual,
                    label: `${userLevel.percentual}% para Level ${userLevel.nivel + 1}`,
                  }}
                  indice={0}
                />
                <CartaoKpi
                  titulo="Streak"
                  valor={`${dailyStats.streakAtual}`}
                  label="dias em sequencia"
                  icone={Flame}
                  corIcone="bg-[var(--danger-soft)] text-[var(--destructive)]"
                  tendencia={tendencias.streak}
                  indice={1}
                />
                <CartaoKpi
                  titulo="Energia"
                  valor={`${energiaPercentual}%`}
                  label="momentum do dia"
                  icone={Zap}
                  corIcone="bg-[var(--warning-soft)] text-[var(--warning)]"
                  tendencia={tendencias.energia}
                  progresso={{
                    valor: energiaPercentual,
                    label: "Energia do Builder",
                  }}
                  indice={2}
                />
                <CartaoKpi
                  titulo="Tarefas hoje"
                  valor={`${dailyStats.tarefasHoje}`}
                  label={dailyStats.tarefasUrgentes > 0 ? `${dailyStats.tarefasUrgentes} urgentes` : "nenhuma urgente"}
                  icone={ListTodo}
                  corIcone="bg-[var(--info-soft)] text-[var(--info)]"
                  tendencia={tendencias.tarefas}
                  indice={3}
                />
              </>
            )}
          </SecaoAnimada>

          {/* Charts + Weekly Progress Row */}
          <SecaoAnimada className="grid gap-6 lg:grid-cols-5" aria-label="Graficos e progresso">
            <div className="lg:col-span-3">
              {carregando ? (
                <EsqueletoCartao linhasConteudo={8} />
              ) : (
                <GraficoAtividade dados={dadosAtividadeSemanal} />
              )}
            </div>
            <div className="lg:col-span-2">
              {carregando ? (
                <EsqueletoCartao linhasConteudo={6} />
              ) : (
                <ProgressoSemanal itens={progressoSemanal} />
              )}
            </div>
          </SecaoAnimada>

          {/* Daily Quests + Agenda Row */}
          <SecaoAnimada className="grid gap-6 lg:grid-cols-2" aria-label="Missoes e agenda">
            {carregando ? (
              <>
                <EsqueletoCartao linhasConteudo={5} />
                <EsqueletoCartao linhasConteudo={4} />
              </>
            ) : (
              <>
                <SecaoMissoesDiarias missoes={missoesDiarias} />
                <SecaoAgendaDia eventos={eventosHoje} />
              </>
            )}
          </SecaoAnimada>

          {/* Conquistas */}
          {carregando ? (
            <DivAnimada>
              <EsqueletoCartao linhasConteudo={3} />
            </DivAnimada>
          ) : (
            <SecaoAnimada aria-label="Conquistas recentes">
              <SecaoConquistas conquistas={conquistasRecentes} />
            </SecaoAnimada>
          )}
        </div>
      </AnimacaoPagina>

      <AcoesRapidasInicio />
    </>
  )
}

export default function PaginaInicio() {
  return (
    <ErrorBoundary>
      <ConteudoPaginaInicio />
    </ErrorBoundary>
  )
}
