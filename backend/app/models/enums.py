from enum import Enum


class Prioridade(str, Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"


class ColunaKanban(str, Enum):
    BACKLOG = "backlog"
    A_FAZER = "a_fazer"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"


class FrequenciaHabito(str, Enum):
    DIARIO = "diario"
    SEMANAL = "semanal"


class StatusMeta(str, Enum):
    A_FAZER = "a_fazer"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"


class ModoFoco(str, Enum):
    POMODORO = "pomodoro"
    DEEP_WORK = "deep_work"
    FLOWTIME = "flowtime"


class EventStatus(str, Enum):
    CONFIRMADO = "confirmado"
    PENDENTE = "pendente"
    FOCO = "foco"


class AutorMensagem(str, Enum):
    USUARIO = "usuario"
    ASSISTENTE = "assistente"
