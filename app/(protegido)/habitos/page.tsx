"use client";

import { AlertCircle } from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { AnimacaoPagina, SecaoAnimada } from "@/componentes/ui/animacoes";
import { cn } from "@/lib/utilidades";

// Sub-components
import { ListaHabitos } from "@/componentes/habitos/lista-habitos";
import { KanbanObjetivos, KanbanMetas } from "@/componentes/habitos/aba-metas";
import {
  FormularioNovoHabito,
  FormularioNovoPlano,
  FormularioNovaMeta,
  DialogoEditarPlano,
  DialogoEditarMeta,
} from "@/componentes/habitos/formulario-habito";
import { useHabitosPage } from "@/componentes/habitos/useHabitosPage";

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PaginaHabitos() {
  const {
    isLoading,
    hasError,
    errorMessage,
    abaAtiva,
    setAbaAtiva,
    modalNovoHabitoAberto,
    setModalNovoHabitoAberto,
    modalNovoPlanoAberto,
    setModalNovoPlanoAberto,
    modalNovaMetaAberto,
    setModalNovaMetaAberto,
    categoriasHabitos,
    colunasObjetivos,
    colunasMetas,
    objetivoEditando,
    formObjetivo,
    metaEditando,
    formMeta,
    isCreatingHabito,
    isRegistrandoHabito,
    isCreatingObjetivo,
    isUpdatingObjetivo,
    isCreatingMeta,
    isUpdatingMeta,
    alternarHabito,
    criarHabito,
    criarPlanoIndividual,
    criarMetaAno,
    abrirEdicaoObjetivo,
    salvarEdicaoObjetivo,
    fecharEdicaoObjetivo,
    atualizarFormObjetivo,
    abrirEdicaoMeta,
    salvarEdicaoMeta,
    fecharEdicaoMeta,
    atualizarFormMeta,
    aoFinalizarArrasteObjetivos,
    aoFinalizarArrasteMetas,
  } = useHabitosPage();

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-7 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-[color:var(--borda-cartao)] bg-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (hasError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-semibold">Erro ao carregar dados</h2>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Botao onClick={() => window.location.reload()}>Tentar novamente</Botao>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        {/* Header */}
        <SecaoAnimada className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-titulo text-2xl font-semibold">Hábitos</h1>
              <p className="text-sm text-muted-foreground">
                Organize metas e mantenha consistência diária.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {abaAtiva === "individual" ? (
              <>
                <FormularioNovoHabito
                  open={modalNovoHabitoAberto}
                  onOpenChange={setModalNovoHabitoAberto}
                  categorias={categoriasHabitos}
                  onSubmit={criarHabito}
                  isPending={isCreatingHabito}
                />
                <FormularioNovoPlano
                  open={modalNovoPlanoAberto}
                  onOpenChange={setModalNovoPlanoAberto}
                  onSubmit={criarPlanoIndividual}
                  isPending={isCreatingObjetivo}
                />
              </>
            ) : (
              <FormularioNovaMeta
                open={modalNovaMetaAberto}
                onOpenChange={setModalNovaMetaAberto}
                onSubmit={criarMetaAno}
                isPending={isCreatingMeta}
              />
            )}

            <DialogoEditarPlano
              objetivoEditando={objetivoEditando}
              onClose={fecharEdicaoObjetivo}
              formObjetivo={formObjetivo}
              onUpdateForm={atualizarFormObjetivo}
              onSalvar={salvarEdicaoObjetivo}
              isPending={isUpdatingObjetivo}
            />
            <DialogoEditarMeta
              metaEditando={metaEditando}
              onClose={fecharEdicaoMeta}
              formMeta={formMeta}
              onUpdateForm={atualizarFormMeta}
              onSalvar={salvarEdicaoMeta}
              isPending={isUpdatingMeta}
            />
          </div>
        </SecaoAnimada>

        {/* Tab Switcher */}
        <SecaoAnimada className="flex flex-wrap items-center gap-2">
          <Botao
            type="button"
            variant="secondary"
            aria-pressed={abaAtiva === "individual"}
            onClick={() => setAbaAtiva("individual")}
            className={cn(
              "rounded-full px-4",
              abaAtiva === "individual"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Plano individual
          </Botao>
          <Botao
            type="button"
            variant="secondary"
            aria-pressed={abaAtiva === "metas"}
            onClick={() => setAbaAtiva("metas")}
            className={cn(
              "rounded-full px-4",
              abaAtiva === "metas"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Metas do ano
          </Botao>
        </SecaoAnimada>

        {/* Tab Content */}
        {abaAtiva === "individual" ? (
          <>
            <KanbanObjetivos
              colunasObjetivos={colunasObjetivos}
              onDragEnd={aoFinalizarArrasteObjetivos}
              onEditarObjetivo={abrirEdicaoObjetivo}
            />
            <ListaHabitos
              categorias={categoriasHabitos}
              onAlternarHabito={alternarHabito}
              disabled={isRegistrandoHabito}
            />
          </>
        ) : (
          <KanbanMetas
            colunasMetas={colunasMetas}
            onDragEnd={aoFinalizarArrasteMetas}
            onEditarMeta={abrirEdicaoMeta}
          />
        )}

      </AnimacaoPagina>
    </main>
  );
}
