"use client"

import { CalendarDays, Loader2 } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { Botao } from "@/componentes/ui/botao"
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
} from "@/componentes/ui/dialogo"
import {
  Flutuante,
  FlutuanteConteudo,
  FlutuanteGatilho,
} from "@/componentes/ui/flutuante"
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor"
import { Calendario } from "@/componentes/ui/calendario"
import { cn } from "@/lib/utilidades"
import type { Prioridade, Estagio } from "@/lib/supabase/types"

import {
  estagiosKanban,
  formatarData,
  type FormularioTarefa,
} from "./tipos"

export type FormularioTarefaDialogoProps = {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  titulo: string
  descricao: string
  formulario: FormularioTarefa
  onAtualizar: (parcial: Partial<FormularioTarefa>) => void
  onSubmit: () => void
  salvando: boolean
  textoBotao: string
  gatilho?: React.ReactNode
}

export function FormularioTarefaDialogo({
  aberto,
  onOpenChange,
  titulo,
  descricao,
  formulario,
  onAtualizar,
  onSubmit,
  salvando,
  textoBotao,
  gatilho,
}: FormularioTarefaDialogoProps) {
  const idSufixo = titulo.includes("Nova") ? "nova" : "edicao"

  return (
    <Dialogo open={aberto} onOpenChange={onOpenChange}>
      {gatilho}
      <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>{titulo}</DialogoTitulo>
          <DialogoDescricao>{descricao}</DialogoDescricao>
        </DialogoCabecalho>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <div className="space-y-2">
            <label
              htmlFor={`titulo-${idSufixo}`}
              className="text-sm font-medium"
            >
              Titulo
            </label>
            <input
              id={`titulo-${idSufixo}`}
              value={formulario.titulo}
              onChange={(event) =>
                onAtualizar({ titulo: event.target.value })
              }
              placeholder="Ex: Finalizar relatório"
              className="h-10 w-full rounded-md border border-input bg-[#F5F5F5] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-muted"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor={`prioridade-${idSufixo}`}
                className="text-sm font-medium"
              >
                Prioridade
              </label>
              <Seletor
                value={formulario.prioridade}
                onValueChange={(valor) =>
                  onAtualizar({ prioridade: valor as Prioridade })
                }
              >
                <SeletorGatilho id={`prioridade-${idSufixo}`} className="bg-[#F5F5F5] dark:bg-muted">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="alta">Alta</SeletorItem>
                  <SeletorItem value="media">Media</SeletorItem>
                  <SeletorItem value="baixa">Baixa</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`vencimento-${idSufixo}`}
                className="text-sm font-medium"
              >
                Data de vencimento
              </label>
              <Flutuante>
                <FlutuanteGatilho asChild>
                  <Botao
                    id={`vencimento-${idSufixo}`}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#F5F5F5] dark:bg-muted",
                      !formulario.dataVencimento &&
                        !formulario.prazo &&
                        "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formulario.dataVencimento
                      ? formatarData(formulario.dataVencimento)
                      : formulario.prazo || "Selecionar data"}
                  </Botao>
                </FlutuanteGatilho>
                <FlutuanteConteudo className="w-auto p-2" align="start">
                  <Calendario
                    mode="single"
                    selected={formulario.dataVencimento}
                    onSelect={(data) =>
                      onAtualizar({
                        dataVencimento: data ?? undefined,
                        prazo: "",
                      })
                    }
                    locale={ptBR}
                    initialFocus
                  />
                </FlutuanteConteudo>
              </Flutuante>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor={`categoria-${idSufixo}`}
                className="text-sm font-medium"
              >
                Categoria
              </label>
              <input
                id={`categoria-${idSufixo}`}
                value={formulario.categoria}
                onChange={(event) =>
                  onAtualizar({ categoria: event.target.value })
                }
                placeholder="Ex: Financeiro"
                className="h-10 w-full rounded-md border border-input bg-[#F5F5F5] px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-muted"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`estagio-${idSufixo}`}
                className="text-sm font-medium"
              >
                Estagio
              </label>
              <Seletor
                value={formulario.coluna}
                onValueChange={(valor) =>
                  onAtualizar({ coluna: valor as Estagio })
                }
              >
                <SeletorGatilho id={`estagio-${idSufixo}`} className="bg-[#F5F5F5] dark:bg-muted">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {estagiosKanban.map((estagio) => (
                    <SeletorItem key={estagio.id} value={estagio.id}>
                      {estagio.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`descricao-${idSufixo}`}
              className="text-sm font-medium"
            >
              Descricao
            </label>
            <textarea
              id={`descricao-${idSufixo}`}
              value={formulario.descricao}
              onChange={(event) =>
                onAtualizar({ descricao: event.target.value })
              }
              placeholder="Observacoes rapidas sobre a tarefa..."
              className="min-h-[90px] w-full rounded-md border border-input bg-[#F5F5F5] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-muted"
            />
          </div>
        </form>
        <DialogoRodape className="mt-6 sm:justify-between">
          <DialogoFechar asChild>
            <Botao variant="outline">Cancelar</Botao>
          </DialogoFechar>
          <Botao
            type="button"
            onClick={onSubmit}
            disabled={salvando}
          >
            {salvando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {textoBotao}
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
