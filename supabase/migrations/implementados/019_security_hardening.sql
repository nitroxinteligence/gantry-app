-- ============================================================================
-- Migration 019: Security Hardening
-- ============================================================================
-- 1. Adiciona auth.uid() na função check_habit (gap da migration 010)
-- 2. Revoga EXECUTE de funções internas que não devem ser chamadas via RPC
-- 3. Revoga EXECUTE do trigger log_audit_change
-- ============================================================================

-- ==========================================
-- 1. check_habit - Adicionar auth.uid() validation
-- ==========================================
-- A função original (migration 004) verifica ownership via WHERE clause
-- (h.user_id = p_user_id), mas NÃO valida que p_user_id = auth.uid().
-- Um usuário autenticado poderia chamar check_habit com o UUID de outro usuário.
CREATE OR REPLACE FUNCTION public.check_habit(
  p_habit_id UUID,
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  streak_atual INTEGER,
  xp_ganho INTEGER,
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_xp INTEGER;
  v_streak INTEGER;
  v_habit_record RECORD;
  v_xp_result RECORD;
  v_yesterday DATE;
  v_yesterday_checked BOOLEAN;
BEGIN
  -- Auth validation (adicionado por segurança)
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot check habit for another user';
  END IF;

  SELECT h.xp_por_check, h.streak_atual INTO v_habit_record
  FROM public.habits h WHERE h.id = p_habit_id AND h.user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Habit not found or not owned by user'; END IF;

  v_xp := v_habit_record.xp_por_check;
  v_streak := v_habit_record.streak_atual;

  IF EXISTS (SELECT 1 FROM public.habit_history WHERE habito_id = p_habit_id AND data = p_date) THEN
    RETURN QUERY SELECT v_streak, 0, 0, 0, false;
    RETURN;
  END IF;

  v_yesterday := p_date - INTERVAL '1 day';
  SELECT EXISTS(SELECT 1 FROM public.habit_history WHERE habito_id = p_habit_id AND data = v_yesterday) INTO v_yesterday_checked;
  IF v_yesterday_checked THEN v_streak := v_streak + 1; ELSE v_streak := 1; END IF;

  v_xp := v_xp + LEAST(v_xp, v_xp * (v_streak - 1) / 10);
  INSERT INTO public.habit_history (habito_id, user_id, data, xp_ganho, concluido) VALUES (p_habit_id, p_user_id, p_date, v_xp, true);
  UPDATE public.habits SET streak_atual = v_streak, maior_streak = GREATEST(maior_streak, v_streak) WHERE id = p_habit_id;
  SELECT * INTO v_xp_result FROM public.add_user_xp(p_user_id, v_xp);
  RETURN QUERY SELECT v_streak, v_xp, v_xp_result.new_total_xp, v_xp_result.new_level, v_xp_result.level_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. Revogar EXECUTE de funções internas
-- ==========================================
-- Funções auxiliares que são chamadas APENAS por outras funções SECURITY DEFINER.
-- Não devem ser acessíveis diretamente via RPC.

-- calculate_level: função interna usada por add_user_xp
REVOKE EXECUTE ON FUNCTION public.calculate_level(INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calculate_level(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.calculate_level(INTEGER) FROM authenticated;

-- calculate_focus_xp: função interna usada por complete_focus_session
REVOKE EXECUTE ON FUNCTION public.calculate_focus_xp(INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calculate_focus_xp(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.calculate_focus_xp(INTEGER) FROM authenticated;

-- add_task_time: função interna usada por complete_focus_session
REVOKE EXECUTE ON FUNCTION public.add_task_time(UUID, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_task_time(UUID, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_task_time(UUID, INTEGER) FROM authenticated;

-- log_audit_change: trigger function, não deve ser chamável via RPC
REVOKE EXECUTE ON FUNCTION public.log_audit_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_audit_change() FROM authenticated;
