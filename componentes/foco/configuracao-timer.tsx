"use client"

import {
  Cartao,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor"
import { FOCUS_MODES, type FocusTask } from "@/app/(protegido)/foco/types"

interface ConfiguracaoTimerProps {
  modoSelecionado: string
  aoSelecionarModo: (valor: string) => void
  tarefaSelecionada: string
  aoSelecionarTarefa: (valor: string) => void
  tarefasDisponiveis: FocusTask[]
  duracaoPersonalizada: number
  aoAtualizarDuracaoPersonalizada: (valor: number) => void
  sessaoIniciada: boolean
}

export function ConfiguracaoTimer({
  modoSelecionado,
  aoSelecionarModo,
  tarefaSelecionada,
  aoSelecionarTarefa,
  tarefasDisponiveis,
  duracaoPersonalizada,
  aoAtualizarDuracaoPersonalizada,
  sessaoIniciada,
}: ConfiguracaoTimerProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Cartao>
        <CartaoConteudo className="space-y-3 p-5">
          <div>
            <CartaoTitulo className="text-base">
              Tarefa do Kanban
            </CartaoTitulo>
            <CartaoDescricao>
              Escolha o que você quer concluir nesta sessão.
            </CartaoDescricao>
          </div>
          <Seletor
            value={tarefaSelecionada}
            onValueChange={aoSelecionarTarefa}
            disabled={sessaoIniciada}
          >
            <SeletorGatilho className="bg-[#F5F5F5] dark:bg-muted">
              <SeletorValor placeholder="Selecione uma tarefa" />
            </SeletorGatilho>
            <SeletorConteudo>
              {tarefasDisponiveis.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Nenhuma tarefa disponível
                </div>
              ) : (
                tarefasDisponiveis.map((tarefa) => (
                  <SeletorItem key={tarefa.id} value={tarefa.id}>
                    {tarefa.titulo} • {tarefa.coluna}
                  </SeletorItem>
                ))
              )}
            </SeletorConteudo>
          </Seletor>
        </CartaoConteudo>
      </Cartao>

      <Cartao>
        <CartaoConteudo className="space-y-3 p-5">
          <div>
            <CartaoTitulo className="text-base">
              Modo de foco
            </CartaoTitulo>
            <CartaoDescricao>
              Defina a duração que melhor combina com seu ritmo.
            </CartaoDescricao>
          </div>
          <Seletor
            value={modoSelecionado}
            onValueChange={aoSelecionarModo}
            disabled={sessaoIniciada}
          >
            <SeletorGatilho className="bg-[#F5F5F5] dark:bg-muted">
              <SeletorValor placeholder="Selecione o modo" />
            </SeletorGatilho>
            <SeletorConteudo>
              {FOCUS_MODES.map((modo) => (
                <SeletorItem key={modo.id} value={modo.id}>
                  {modo.titulo} •{" "}
                  {modo.id === "custom"
                    ? `${duracaoPersonalizada} min`
                    : `${modo.duracao} min`}
                </SeletorItem>
              ))}
            </SeletorConteudo>
          </Seletor>
          {modoSelecionado === "custom" && !sessaoIniciada ? (
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] p-3">
              <label
                htmlFor="duracao-personalizada"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Defina o tempo (min)
              </label>
              <input
                id="duracao-personalizada"
                type="number"
                min={5}
                max={180}
                step={5}
                value={duracaoPersonalizada}
                onChange={(event) => {
                  const valor = Number(event.target.value)
                  if (Number.isNaN(valor)) {
                    return
                  }
                  aoAtualizarDuracaoPersonalizada(valor)
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Ajuste entre 5 e 180 minutos.
              </p>
            </div>
          ) : null}
        </CartaoConteudo>
      </Cartao>
    </section>
  )
}
