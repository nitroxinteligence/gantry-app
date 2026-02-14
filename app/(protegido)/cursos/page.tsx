"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  BookOpenText,
  Lock,
  Search,
  Award,
} from "lucide-react"
import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
import { Emblema } from "@/componentes/ui/emblema"
import { Progresso } from "@/componentes/ui/progresso"
import { AnimacaoPagina, SecaoAnimada } from "@/componentes/ui/animacoes"
import { Esqueleto } from "@/componentes/ui/esqueleto"
import { useCursosData } from "@/hooks/useCursos"
import { CursoDetalhe } from "@/componentes/cursos/curso-detalhe"
import { AulaDetalhe } from "@/componentes/cursos/aula-detalhe"

export default function PaginaCursos() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cursoSlug = searchParams.get("curso")
  const aulaId = searchParams.get("aula")

  const [categoriaAtiva, setCategoriaAtiva] = React.useState("Todos")
  const [busca, setBusca] = React.useState("")

  const navCurso = React.useCallback((slug: string) => {
    router.push(`/cursos?curso=${slug}`)
  }, [router])

  const navAula = React.useCallback((aula: string) => {
    router.push(`/cursos?curso=${cursoSlug}&aula=${aula}`)
  }, [router, cursoSlug])

  const voltarLista = React.useCallback(() => {
    router.push("/cursos")
  }, [router])

  const voltarCurso = React.useCallback(() => {
    router.push(`/cursos?curso=${cursoSlug}`)
  }, [router, cursoSlug])

  // View: Aula detalhe
  if (cursoSlug && aulaId) {
    return (
      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <AulaDetalhe
            cursoSlug={cursoSlug}
            aulaId={aulaId}
            onSelectAula={navAula}
            onVoltar={voltarCurso}
          />
        </div>
      </main>
    )
  }

  // View: Curso detalhe
  if (cursoSlug) {
    return (
      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <CursoDetalhe
            cursoSlug={cursoSlug}
            onSelectAula={navAula}
            onVoltar={voltarLista}
          />
        </div>
      </main>
    )
  }

  // View: Lista de cursos
  return <ListaCursos
    categoriaAtiva={categoriaAtiva}
    setCategoriaAtiva={setCategoriaAtiva}
    busca={busca}
    setBusca={setBusca}
    onSelectCurso={navCurso}
  />
}

// ============================================================================
// Lista de cursos (view principal)
// ============================================================================

interface ListaCursosProps {
  categoriaAtiva: string
  setCategoriaAtiva: (cat: string) => void
  busca: string
  setBusca: (busca: string) => void
  onSelectCurso: (slug: string) => void
}

function ListaCursos({ categoriaAtiva, setCategoriaAtiva, busca, setBusca, onSelectCurso }: ListaCursosProps) {
  const {
    cursos,
    categorias,
    cursosDestaque,
    cursosContinuar,
    novosConteudos,
    isLoading,
    error,
  } = useCursosData()

  const textoBusca = busca.trim().toLowerCase()

  const cursosFiltrados = React.useMemo(() => {
    return cursos.filter(({ curso }) => {
      if (categoriaAtiva !== "Todos" && curso.categoria !== categoriaAtiva) {
        return false
      }
      if (!textoBusca) return true
      return (
        curso.titulo.toLowerCase().includes(textoBusca) ||
        (curso.descricao?.toLowerCase().includes(textoBusca) ?? false)
      )
    })
  }, [cursos, categoriaAtiva, textoBusca])

  const semConteudo = !isLoading && !error && cursos.length === 0 && novosConteudos.length === 0

  if (isLoading || semConteudo) {
    return (
      <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Esqueleto className="h-8 w-48" />
              <Esqueleto className="h-4 w-64" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-5">
                <Esqueleto className="mb-4 h-5 w-3/4" />
                <Esqueleto className="mb-4 h-4 w-1/2" />
                <Esqueleto className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-destructive">Erro ao carregar cursos: {error.message}</p>
      </main>
    )
  }

  return (
    <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <SecaoAnimada className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-titulo text-xl font-semibold sm:text-2xl">
              Cursos e aulas
            </h1>
            <p className="text-sm text-muted-foreground">
              Evolua sua rotina com nossos cursos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar cursos"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-52"
              />
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {categorias.map((categoria) => (
                <Botao
                  key={categoria}
                  type="button"
                  variant={categoriaAtiva === categoria ? "default" : "ghost"}
                  size="sm"
                  className="min-h-[44px] shrink-0"
                  onClick={() => setCategoriaAtiva(categoria)}
                >
                  {categoria}
                </Botao>
              ))}
            </div>
          </div>
        </SecaoAnimada>

        {cursosContinuar.length > 0 && (
          <SecaoAnimada className="space-y-4">
            <h2 className="font-titulo text-lg font-semibold">Continue assistindo</h2>
            <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
              <div className="flex min-w-[640px] gap-4">
                {cursosContinuar.map(({ curso, resumo }) => (
                  <Cartao key={curso.id} interativo className="min-w-[260px] overflow-hidden">
                    <button type="button" onClick={() => onSelectCurso(curso.slug)} className="w-full text-left">
                      <div className="h-28 bg-gradient-to-br from-primary/10 via-accent to-background p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                          <Emblema variant="outline">{curso.categoria}</Emblema>
                          <BookOpenText className="h-4 w-4" />
                        </div>
                        <p className="mt-6 text-sm font-semibold text-foreground">{curso.titulo}</p>
                      </div>
                      <CartaoConteudo className="space-y-3 p-4">
                        <div>
                          <CartaoTitulo className="text-base">{curso.nivel}</CartaoTitulo>
                          <CartaoDescricao>
                            {resumo.aulasConcluidas} de {resumo.totalAulas} aulas concluidas
                          </CartaoDescricao>
                        </div>
                        <Progresso value={resumo.progresso} />
                        <Emblema variant={resumo.progresso === 100 ? "sucesso" : "secondary"}>
                          {resumo.progresso}% completo
                        </Emblema>
                      </CartaoConteudo>
                    </button>
                  </Cartao>
                ))}
              </div>
            </div>
          </SecaoAnimada>
        )}

        {cursosDestaque.length > 0 && (
          <SecaoAnimada className="space-y-4">
            <h2 className="font-titulo text-lg font-semibold">Em destaque</h2>
            <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
              <div className="flex min-w-[640px] gap-4">
                {cursosDestaque.map(({ curso, resumo }) => (
                  <Cartao key={curso.id} interativo className="min-w-[260px] overflow-hidden">
                    <button type="button" onClick={() => onSelectCurso(curso.slug)} className="w-full text-left">
                      <div className="h-28 bg-gradient-to-br from-primary/10 via-accent to-background p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                          <Emblema variant="outline">{curso.categoria}</Emblema>
                          <BookOpenText className="h-4 w-4" />
                        </div>
                        <p className="mt-6 text-sm font-semibold text-foreground">{curso.titulo}</p>
                      </div>
                      <CartaoConteudo className="space-y-3 p-4">
                        <CartaoTitulo className="text-base">{curso.nivel}</CartaoTitulo>
                        <CartaoDescricao>
                          {resumo.totalAulas} aulas • {resumo.progresso}% concluido
                        </CartaoDescricao>
                        {resumo.progresso === 100 ? (
                          <Emblema variant="sucesso" className="gap-1">
                            <Award className="h-3 w-3" />
                            Concluido
                          </Emblema>
                        ) : null}
                      </CartaoConteudo>
                    </button>
                  </Cartao>
                ))}
              </div>
            </div>
          </SecaoAnimada>
        )}

        {novosConteudos.length > 0 && (
          <SecaoAnimada className="space-y-4">
            <h2 className="font-titulo text-lg font-semibold">Novos conteúdos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {novosConteudos.map((curso) => (
                <Cartao key={curso.id} className="overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-muted via-background to-secondary p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <Emblema variant="secondary">Em breve</Emblema>
                      <Lock className="h-4 w-4" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-foreground">{curso.titulo}</p>
                  </div>
                  <CartaoConteudo className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CartaoTitulo className="text-base">{curso.nivel}</CartaoTitulo>
                        <CartaoDescricao>{curso.descricao}</CartaoDescricao>
                      </div>
                      <Emblema variant="outline">Bloqueado</Emblema>
                    </div>
                    <Botao variant="outline" size="sm" disabled className="min-h-[44px]">
                      Acesso bloqueado
                    </Botao>
                  </CartaoConteudo>
                </Cartao>
              ))}
            </div>
          </SecaoAnimada>
        )}

        <SecaoAnimada className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {cursosFiltrados.map(({ curso, resumo }) => (
              <Cartao key={curso.id} interativo>
                <button type="button" onClick={() => onSelectCurso(curso.slug)} className="w-full text-left">
                  <CartaoConteudo className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CartaoTitulo className="text-base">{curso.titulo}</CartaoTitulo>
                        <CartaoDescricao>{curso.descricao}</CartaoDescricao>
                      </div>
                      <Emblema variant="secondary">{curso.nivel}</Emblema>
                    </div>
                    <div className="flex items-center gap-2">
                      <Emblema variant="outline">{curso.categoria}</Emblema>
                      <span className="text-xs text-muted-foreground">
                        {resumo.totalAulas} aulas
                      </span>
                      {resumo.progresso === 100 ? (
                        <Emblema variant="sucesso" className="gap-1">
                          <Award className="h-3 w-3" />Concluido
                        </Emblema>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {resumo.progresso}% concluido
                        </span>
                      )}
                    </div>
                    <Progresso value={resumo.progresso} />
                  </CartaoConteudo>
                </button>
              </Cartao>
            ))}
          </div>
        </SecaoAnimada>
      </AnimacaoPagina>
    </main>
  )
}
