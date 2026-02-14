"use client"

import { CalendarDays, Check, Pencil, Trash2, Zap } from "lucide-react"
import { Draggable } from "@hello-pangea/dnd"

import { Botao } from "@/componentes/ui/botao"
import { Emblema } from "@/componentes/ui/emblema"
import { cn } from "@/lib/utilidades"
import type { Tarefa } from "@/lib/supabase/types"
import { estilosPrioridade } from "./tipos"

export type TarefaCardProps = {
  tarefa: Tarefa
  index: number
  onEditar: (tarefa: Tarefa) => void
  onExcluir: (tarefa: Tarefa) => void
  onConcluir: (tarefa: Tarefa) => void
}

export function TarefaCard({
  tarefa,
  index,
  onEditar,
  onExcluir,
  onConcluir,
}: TarefaCardProps) {
  return (
    <Draggable draggableId={tarefa.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className="rounded-[var(--radius)] border border-[color:var(--borda-cartao)] bg-[#F9F9F9] p-4 transition-all duration-200 hover:shadow-sm dark:bg-card"
        >
          <div className="flex items-start justify-between gap-2">
            <Emblema
              className={cn(
                "text-[10px] uppercase tracking-[0.2em]",
                estilosPrioridade[tarefa.prioridade]
              )}
            >
              {tarefa.prioridade}
            </Emblema>
            <Emblema variant="default" className="gap-1">
              <Zap className="h-3 w-3" />
              +{tarefa.xp_recompensa} XP
            </Emblema>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {tarefa.titulo}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {tarefa.data_limite || "Sem prazo"}
            </span>
            <div className="flex items-center gap-1">
              {tarefa.coluna !== "concluido" ? (
                <Botao
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Concluir tarefa"
                  onClick={() => onConcluir(tarefa)}
                >
                  <Check className="h-4 w-4" />
                </Botao>
              ) : null}
              <Botao
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Editar tarefa"
                onClick={() => onEditar(tarefa)}
              >
                <Pencil className="h-4 w-4" />
              </Botao>
              <Botao
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                aria-label="Excluir tarefa"
                onClick={() => onExcluir(tarefa)}
              >
                <Trash2 className="h-4 w-4" />
              </Botao>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
