-- ============================================================================
-- Migration 020: Tabelas do Assistente IA
-- ============================================================================
-- Cria tabelas para conversas e mensagens do assistente inteligente.
-- ============================================================================

-- Conversas
CREATE TABLE IF NOT EXISTS conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT 'Nova conversa',
  ultima_mensagem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  autor TEXT NOT NULL CHECK (autor IN ('usuario', 'assistente')),
  conteudo TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversas_user_id ON conversas(user_id);
CREATE INDEX idx_conversas_updated_at ON conversas(updated_at DESC);
CREATE INDEX idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_created_at ON mensagens(created_at);

-- Updated_at trigger for conversas
CREATE OR REPLACE FUNCTION update_conversas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversas_updated_at
  BEFORE UPDATE ON conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_conversas_updated_at();

-- RLS
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own conversas"
  ON conversas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversas"
  ON conversas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversas"
  ON conversas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversas"
  ON conversas FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can select mensagens in own conversas"
  ON mensagens FOR SELECT
  USING (conversa_id IN (SELECT id FROM conversas WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert mensagens in own conversas"
  ON mensagens FOR INSERT
  WITH CHECK (conversa_id IN (SELECT id FROM conversas WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete mensagens in own conversas"
  ON mensagens FOR DELETE
  USING (conversa_id IN (SELECT id FROM conversas WHERE user_id = auth.uid()));
