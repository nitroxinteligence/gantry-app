from pydantic import BaseModel


class ResumoUsuario(BaseModel):
    nome: str
    email: str
    nivel: int
    xp_total: int
    streak_atual: int
    maior_streak: int
    streak_shields: int
    avatar_url: str | None
    criado_em: str


class ResumoTarefa(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    prioridade: str
    status: str
    coluna: str
    data_limite: str | None
    tags: list[str]
    tempo_gasto: int
    xp_recompensa: int


class ResumoPendencia(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    prioridade: str
    categoria: str | None
    data_vencimento: str | None


class ResumoHabito(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    streak_atual: int
    maior_streak: int
    frequencia: str
    dias_semana: list[int]
    xp_por_check: int
    categoria_id: str | None
    concluido_hoje: bool


class ResumoCategoriaHabito(BaseModel):
    id: str
    titulo: str
    icone: str
    cor: str


class ResumoFoco(BaseModel):
    sessoes_dia: int
    minutos_dia: int
    sessoes_semana: int
    minutos_semana: int
    total_sessoes: int
    total_minutos: int
    media_minutos_por_sessao: int
    xp_total_foco: int


class ResumoMeta(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    progresso_atual: int
    progresso_total: int
    unidade: str
    status: str
    prazo: str | None
    xp_recompensa: int


class ResumoObjetivo(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    categoria: str
    progresso_atual: int
    progresso_total: int
    status: str
    habitos_chave: list[str]
    xp_recompensa: int


class ResumoEvento(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    data: str
    horario_inicio: str
    horario_fim: str
    categoria: str
    local: str | None
    status: str


class ResumoCurso(BaseModel):
    id: str
    titulo: str
    descricao: str | None
    categoria: str
    nivel: str
    total_aulas: int
    aulas_concluidas: int
    progresso_percentual: float


class AnalisePerformance(BaseModel):
    tarefas_concluidas_ultimos_7_dias: int
    tarefas_total_ativas: int
    taxa_conclusao_tarefas: int
    habitos_concluidos_hoje: int
    habitos_total_ativos: int
    taxa_conclusao_habitos: int
    foco_minutos_hoje: int
    foco_minutos_semana: int
    foco_media_diaria: int
    metas_em_andamento: int
    metas_concluidas: int
    streak_dias: int
    nivel_progresso: int


class ContextoUsuario(BaseModel):
    usuario: ResumoUsuario
    tarefas: list[ResumoTarefa]
    pendencias: list[ResumoPendencia]
    habitos_ativos: list[ResumoHabito]
    categorias_habito: list[ResumoCategoriaHabito]
    foco_hoje: ResumoFoco
    metas_ativas: list[ResumoMeta]
    objetivos_desenvolvimento: list[ResumoObjetivo]
    eventos_proximos: list[ResumoEvento]
    cursos_em_progresso: list[ResumoCurso]
    analise_performance: AnalisePerformance
