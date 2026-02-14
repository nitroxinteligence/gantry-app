-- ============================================================================
-- BUILDERS PERFORMANCE - RESET USER PASSWORD (TEMPLATE)
-- ============================================================================
-- ⚠️  SCRIPT OPERACIONAL - NÃO EXECUTAR SEM AJUSTAR VARIÁVEIS
-- ⚠️  Este script foi sanitizado para remover credenciais hardcoded.
--     Substitua o placeholder antes de executar manualmente no SQL Editor.
--
-- Data original: 2026-01-28
-- ============================================================================

-- INSTRUÇÕES:
-- 1. Substitua '<USER_EMAIL>' pelo email do usuário
-- 2. Execute no Supabase Dashboard > SQL Editor
-- 3. A nova senha será exibida - SALVE IMEDIATAMENTE

WITH new_password AS (
  SELECT encode(gen_random_bytes(12), 'base64') AS senha
),
update_user AS (
  UPDATE auth.users
  SET
    encrypted_password = crypt((SELECT senha FROM new_password), gen_salt('bf')),
    updated_at = NOW()
  WHERE email = '<USER_EMAIL>'
  RETURNING id, email
)
SELECT
  u.id AS user_id,
  u.email,
  p.senha AS nova_senha
FROM update_user u, new_password p;
