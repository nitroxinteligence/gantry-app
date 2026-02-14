"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpenText,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
import { Progresso } from "@/componentes/ui/progresso"
import { useCursoBySlug } from "@/hooks/useCursos"
import type { CourseModuleWithLessons, LessonWithProgress } from "@/types/cursos"

interface CursoDetalheProps {
  cursoSlug: string
  onSelectAula: (aulaId: string) => void
  onVoltar: () => void
}

export function CursoDetalhe({ cursoSlug, onSelectAula, onVoltar }: CursoDetalheProps) {
  const { data, isLoading, error } = useCursoBySlug(cursoSlug)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="font-titulo text-xl font-semibold">Curso não encontrado</h2>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Não encontramos este curso."}
        </p>
        <Botao onClick={onVoltar}>Voltar para cursos</Botao>
      </div>
    )
  }

  const { curso, modulos, resumo } = data

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <section className="flex flex-col gap-3">
        <Botao variant="ghost" size="sm" onClick={onVoltar} className="w-fit min-h-[44px]">
          Voltar
        </Botao>
        <div>
          <h1 className="font-titulo text-xl font-semibold sm:text-2xl">
            {curso.titulo}
          </h1>
          <p className="text-sm text-muted-foreground">{curso.descricao}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
            <BookOpenText className="h-3 w-3" />
            {curso.categoria}
          </span>
          <span>{curso.nivel}</span>
          <span>{resumo.totalAulas} aulas</span>
          <span>{resumo.progresso}% concluído</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {modulos.map((modulo: CourseModuleWithLessons) => (
            <Cartao key={modulo.id}>
              <CartaoCabecalho className="pb-3">
                <CartaoTitulo className="text-base">{modulo.titulo}</CartaoTitulo>
                <CartaoDescricao>{modulo.descricao}</CartaoDescricao>
              </CartaoCabecalho>
              <CartaoConteudo className="space-y-3">
                {modulo.aulas.map((aula: LessonWithProgress) => (
                  <button
                    key={aula.id}
                    type="button"
                    onClick={() => onSelectAula(aula.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition hover:bg-secondary/40 active:bg-secondary/60"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium text-foreground">{aula.titulo}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        {aula.duracao}
                        <span>•</span>
                        <span>{aula.xp}</span>
                      </div>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {aula.concluida ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </CartaoConteudo>
            </Cartao>
          ))}
        </div>

        <div className="space-y-4">
          <Cartao>
            <CartaoConteudo className="space-y-4 p-5">
              <div>
                <CartaoTitulo className="text-base">Seu progresso</CartaoTitulo>
                <CartaoDescricao>
                  {resumo.aulasConcluidas} de {resumo.totalAulas} aulas concluídas.
                </CartaoDescricao>
              </div>
              <Progresso value={resumo.progresso} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{resumo.progresso}% completo</span>
                <span>{curso.nivel}</span>
              </div>
            </CartaoConteudo>
          </Cartao>
        </div>
      </section>
    </div>
  )
}
