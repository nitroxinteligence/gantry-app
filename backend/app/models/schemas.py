from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversa_id: str
    mensagem: str = Field(min_length=1, max_length=10000)
    historico: list[dict] = Field(default_factory=list)


class BriefingStatusResponse(BaseModel):
    pendente: bool
    briefing_id: str | None = None
    conteudo: str | None = None
    gerado_em: str | None = None


class BriefingResponse(BaseModel):
    conteudo: str
    briefing_id: str


class VoiceTranscribeResponse(BaseModel):
    texto: str


class HealthResponse(BaseModel):
    status: str
    redis: str
    supabase: str


class SSEEvent(BaseModel):
    tipo: str
    conteudo: str
    resultado: dict | None = None
