# Backend Python - Assistente IA

## Stack
- Python 3.12 + FastAPI + Uvicorn
- Gemini 2.5 Flash via google-genai SDK
- Supabase via supabase-py (service role)
- Redis 7-alpine (Docker local VPS)
- PyJWT para auth
- sse-starlette para SSE streaming
- APScheduler para briefing cron

## Env Vars Necessárias
- GEMINI_API_KEY=AIzaSyAMLb4VQC33wX_mm3kIyuucrjk8Y0AoOKc
- SUPABASE_URL=https://xzonhnpjlcinsknqyyap.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=(pegar do .env raiz)
- SUPABASE_JWT_SECRET=(pegar do dashboard Supabase)
- REDIS_URL=redis://redis:6379/0

## Estrutura
```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── routers/
│   │   ├── chat.py          # POST /chat/stream → SSE
│   │   ├── briefing.py      # GET /briefing, GET /briefing/status
│   │   ├── voice.py         # POST /voice/transcribe
│   │   └── health.py        # GET /health
│   ├── services/
│   │   ├── gemini_client.py
│   │   ├── gemini_tools.py  # 18 function declarations
│   │   ├── context_builder.py
│   │   ├── action_executor.py
│   │   ├── briefing_service.py
│   │   ├── conversation_service.py
│   │   ├── voice_service.py
│   │   └── cache_service.py
│   ├── models/
│   │   ├── schemas.py
│   │   ├── context.py
│   │   └── enums.py
│   └── utils/
│       ├── jwt_auth.py
│       └── supabase_client.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── tests/
```

## Endpoints
- POST /chat/stream (JWT) → SSE streaming chat
- GET /briefing (JWT) → gerar briefing
- GET /briefing/status (JWT) → check briefing pendente
- POST /voice/transcribe (JWT) → audio multipart → texto via Gemini
- GET /health → health check

## 18 Function Calls
Tarefas: criar, editar, excluir, concluir
Hábitos: criar, editar, excluir, marcar
Metas: criar, editar, excluir
Pendências: criar
Foco: sugerir
Performance: analisar
Eventos: criar, editar, excluir
Cursos: recomendar

## Chat Flow
1. Recebe msg + JWT
2. Verifica JWT → extrai user_id
3. Carrega contexto (Redis cache, TTL 5min)
4. Carrega histórico (últimas 100 msgs)
5. Gemini generate_content_stream com tools
6. Stream chunks via SSE
7. Se function_call → executa ação → manda resultado de volta ao Gemini
8. Salva no histórico
9. Invalida cache se houve CRUD

## Voz
- Frontend grava MediaRecorder → audio/webm
- Upload multipart POST /voice/transcribe
- Backend: types.Part.from_bytes(data=bytes, mime_type='audio/webm')
- Prompt: "Transcreva este áudio em pt-BR com pontuação"

## Briefing
- Tabela briefing_schedule: user_id + hora_preferida
- APScheduler verifica a cada 1 min
- Gera briefing e salva na tabela briefings
- Frontend consulta /briefing/status ao abrir

## Auth
- PyJWT decode com SUPABASE_JWT_SECRET
- Extrai sub (user_id)
- Middleware Depends(get_current_user)

## Tabelas do Supabase (contexto)
users, tasks, pending_items, focus_sessions, habits, habit_checks,
habit_categories, habit_history, goals, objectives, events,
courses, modules, lessons, lesson_progress, weekly_challenges,
daily_challenges, badges, user_badges

## IMPORTANTE
- Usar client.aio (async) do google-genai
- SSE via sse-starlette EventSourceResponse
- Redis em Docker na mesma VPS (não cloud)
- Supabase service role (bypass RLS)
- Rate limit: 60 msgs/min por user
