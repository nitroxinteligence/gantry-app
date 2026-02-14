-- ============================================================================
-- MIGRATION 021: ADMIN AREA
-- ============================================================================
-- Tabela admin_users para controlar acesso ultra-admin
-- Apenas Junior (dono do app) tem acesso

-- Tabela de admins
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('ultra-admin')) DEFAULT 'ultra-admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Apenas o proprio admin pode ler seu registro
CREATE POLICY "admin_users_select_own"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Ninguem pode inserir/atualizar/deletar via API (apenas via service role)
CREATE POLICY "admin_users_no_insert"
  ON admin_users
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "admin_users_no_update"
  ON admin_users
  FOR UPDATE
  USING (false);

CREATE POLICY "admin_users_no_delete"
  ON admin_users
  FOR DELETE
  USING (false);

-- Funcao helper para verificar se usuario eh admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = p_user_id
  );
$$;

-- Funcao para buscar metricas dos usuarios (somente admin)
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar se caller eh admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: usuario nao eh admin';
  END IF;

  SELECT json_build_object(
    'total_usuarios', (SELECT COUNT(*) FROM users),
    'usuarios_ativos_7d', (
      SELECT COUNT(DISTINCT user_id) FROM focus_sessions
      WHERE created_at >= NOW() - INTERVAL '7 days'
    ),
    'usuarios_ativos_30d', (
      SELECT COUNT(DISTINCT user_id) FROM focus_sessions
      WHERE created_at >= NOW() - INTERVAL '30 days'
    ),
    'xp_medio', (SELECT COALESCE(AVG(total_xp), 0) FROM users),
    'nivel_medio', (SELECT COALESCE(AVG(level), 0) FROM users),
    'total_tarefas_concluidas', (
      SELECT COUNT(*) FROM tasks WHERE status = 'concluido'
    ),
    'total_sessoes_foco', (
      SELECT COUNT(*) FROM focus_sessions WHERE status = 'completed'
    ),
    'total_habitos_ativos', (
      SELECT COUNT(*) FROM habits WHERE ativo = true
    ),
    'streak_medio', (SELECT COALESCE(AVG(current_streak), 0) FROM users),
    'total_cursos_publicados', (
      SELECT COUNT(*) FROM courses WHERE status = 'publicado'
    ),
    'total_aulas_concluidas', (
      SELECT COUNT(*) FROM lesson_progress WHERE concluida = true
    ),
    'novos_usuarios_7d', (
      SELECT COUNT(*) FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
    ),
    'novos_usuarios_30d', (
      SELECT COUNT(*) FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;
