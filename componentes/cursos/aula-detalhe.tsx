"use client"

import * as React from "react"
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  Loader2,
  PlayCircle,
  ThumbsUp,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
import { cn } from "@/lib/utilidades"
import { useCursoBySlug, useCompleteLesson } from "@/hooks/useCursos"
import type { CourseModuleWithLessons, LessonWithProgress } from "@/types/cursos"

interface AulaDetalheProps {
  cursoSlug: string
  aulaId: string
  onSelectAula: (aulaId: string) => void
  onVoltar: () => void
}

export function AulaDetalhe({ cursoSlug, aulaId, onSelectAula, onVoltar }: AulaDetalheProps) {
  const [curtido, setCurtido] = React.useState(false)
  const { data, isLoading, error } = useCursoBySlug(cursoSlug)
  const completeLessonMutation = useCompleteLesson()

  type AulaComModulo = LessonWithProgress & {
    moduloId: string
    moduloTitulo: string
  }

  const aulasDoCurso = React.useMemo((): AulaComModulo[] => {
    if (!data) return []
    return data.modulos.flatMap((modulo: CourseModuleWithLessons) =>
      modulo.aulas.map((aula: LessonWithProgress) => ({
        ...aula,
        moduloId: modulo.id,
        moduloTitulo: modulo.titulo,
      }))
    )
  }, [data])

  const aulaAtual = React.useMemo((): AulaComModulo | undefined => {
    return aulasDoCurso.find((a) => a.id === aulaId)
  }, [aulasDoCurso, aulaId])

  const indiceAula = aulaAtual
    ? aulasDoCurso.findIndex((a) => a.id === aulaAtual.id) + 1
    : 0

  const handleMarcarConcluida = async () => {
    if (!aulaId || aulaAtual?.concluida) return
    try {
      await completeLessonMutation.mutateAsync(aulaId)
    } catch {
      // Error handled by React Query
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data || !aulaAtual) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="font-titulo text-xl font-semibold">Aula não encontrada</h2>
        <Botao onClick={onVoltar}>Voltar</Botao>
      </div>
    )
  }

  const { curso, modulos } = data

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-3">
        <Botao variant="ghost" size="icon" onClick={onVoltar} className="min-h-[44px] min-w-[44px]">
          <ChevronLeft className="h-5 w-5" />
        </Botao>
        <div className="min-w-0">
          <h1 className="truncate font-titulo text-lg font-semibold sm:text-xl">
            {aulaAtual.titulo}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {curso.titulo} • {aulaAtual.moduloTitulo}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row-reverse">
        {/* Lesson sidebar */}
        <aside className="rounded-2xl border border-border bg-card p-4 lg:w-72">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Conteúdo ({aulasDoCurso.length} aulas)
          </p>
          <div className="max-h-60 space-y-1 overflow-y-auto lg:max-h-[50vh]">
            {modulos.map((modulo: CourseModuleWithLessons) => (
              <div key={modulo.id} className="space-y-1">
                <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {modulo.titulo}
                </p>
                {modulo.aulas.map((aula: LessonWithProgress) => {
                  const ativo = aula.id === aulaAtual.id
                  return (
                    <button
                      key={aula.id}
                      type="button"
                      onClick={() => onSelectAula(aula.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                        ativo
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-secondary/60"
                      )}
                    >
                      <span className="truncate">{aula.titulo}</span>
                      {aula.concluida && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
                Aula {indiceAula} de {aulasDoCurso.length}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {aulaAtual.duracao}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Botao
                variant="secondary"
                size="sm"
                className="min-h-[44px]"
                onClick={handleMarcarConcluida}
                disabled={aulaAtual.concluida || completeLessonMutation.isPending}
              >
                {completeLessonMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                ) : aulaAtual.concluida ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" />Concluída</>
                ) : (
                  "Concluir aula"
                )}
              </Botao>
              <Botao
                variant="outline"
                size="sm"
                className={cn(
                  "min-h-[44px] gap-2",
                  curtido
                    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                    : "text-muted-foreground"
                )}
                onClick={() => setCurtido((p) => !p)}
              >
                <ThumbsUp className="h-4 w-4" />
                {curtido ? "Curtido" : "Curtir"}
              </Botao>
            </div>
          </div>

          <div className="aspect-video rounded-2xl border border-border bg-foreground text-background">
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <PlayCircle className="h-10 w-10" />
              <p className="text-sm font-semibold">Player de vídeo (prévia)</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Cartao>
              <CartaoCabecalho className="pb-3">
                <CartaoTitulo className="text-base">Sobre a aula</CartaoTitulo>
                <CartaoDescricao>{aulaAtual.descricao}</CartaoDescricao>
              </CartaoCabecalho>
              <CartaoConteudo className="space-y-2 text-sm text-muted-foreground">
                <p>XP ao concluir: <span className="font-semibold">{aulaAtual.xp}</span></p>
                <p>Curso: <span className="font-semibold">{curso.titulo}</span></p>
              </CartaoConteudo>
            </Cartao>

            <Cartao>
              <CartaoCabecalho className="pb-3">
                <CartaoTitulo className="text-base">Notas rápidas</CartaoTitulo>
              </CartaoCabecalho>
              <CartaoConteudo>
                <textarea
                  placeholder="Escreva suas anotações..."
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </CartaoConteudo>
            </Cartao>
          </div>
        </div>
      </div>
    </div>
  )
}
