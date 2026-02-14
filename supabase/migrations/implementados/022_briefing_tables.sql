-- ============================================================================
-- MIGRATION 022: Tabelas para Briefing Automatico
-- ============================================================================

-- Tabela de agendamento de briefing por usuario
CREATE TABLE IF NOT EXISTS briefing_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hora_preferida TIME NOT NULL DEFAULT '07:00',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Tabela de briefings gerados
CREATE TABLE IF NOT EXISTS briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    gerado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    lido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_briefing_schedule_user ON briefing_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_briefing_schedule_ativo ON briefing_schedule(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_briefings_user ON briefings(user_id);
CREATE INDEX IF NOT EXISTS idx_briefings_gerado_em ON briefings(user_id, gerado_em DESC);

-- RLS
ALTER TABLE briefing_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para briefing_schedule
CREATE POLICY "Users can view own schedule"
    ON briefing_schedule FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule"
    ON briefing_schedule FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule"
    ON briefing_schedule FOR UPDATE
    USING (auth.uid() = user_id);

-- Politicas RLS para briefings
CREATE POLICY "Users can view own briefings"
    ON briefings FOR SELECT
    USING (auth.uid() = user_id);

-- Service role bypass (para APScheduler via service_role key)
CREATE POLICY "Service role full access briefing_schedule"
    ON briefing_schedule FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access briefings"
    ON briefings FOR ALL
    USING (auth.role() = 'service_role');

-- Trigger updated_at
CREATE TRIGGER set_briefing_schedule_updated_at
    BEFORE UPDATE ON briefing_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
