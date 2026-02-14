-- ============================================================================
-- BUILDERS PERFORMANCE - CREATE ADMIN USER (TEMPLATE)
-- ============================================================================
-- ⚠️  SCRIPT OPERACIONAL - NÃO EXECUTAR EM PRODUÇÃO SEM AJUSTAR VARIÁVEIS
-- ⚠️  Este script foi sanitizado para remover credenciais hardcoded.
--     Substitua os placeholders antes de executar manualmente no SQL Editor.
--
-- Data original: 2026-01-28
-- ============================================================================

-- INSTRUÇÕES:
-- 1. Substitua '<ADMIN_EMAIL>' pelo email desejado
-- 2. Substitua '<ADMIN_NAME>' pelo nome desejado
-- 3. Execute no Supabase Dashboard > SQL Editor
-- 4. A senha gerada será exibida como resultado - SALVE IMEDIATAMENTE

WITH
-- 1. Gerar dados do novo usuário
new_user_data AS (
  SELECT
    gen_random_uuid() AS user_id,
    '<ADMIN_EMAIL>' AS email,
    '<ADMIN_NAME>' AS full_name,
    encode(gen_random_bytes(12), 'base64') AS password
),

-- 2. Inserir na tabela auth.users
inserted_user AS (
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  SELECT
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', full_name),
    false,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  FROM new_user_data
  RETURNING id, email
),

-- 3. Inserir identidade para login
inserted_identity AS (
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    i.id,
    i.id::text,
    jsonb_build_object(
      'sub', i.id::text,
      'email', i.email,
      'email_verified', true,
      'provider', 'email'
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  FROM inserted_user i
  RETURNING user_id
),

-- 4. Inserir perfil em public.users
inserted_profile AS (
  INSERT INTO public.users (id, email, name, avatar_url, total_xp, level, created_at, updated_at)
  SELECT
    n.user_id,
    n.email,
    n.full_name,
    NULL,
    0,
    1,
    NOW(),
    NOW()
  FROM new_user_data n
  ON CONFLICT (id) DO NOTHING
  RETURNING id
)

-- 5. RESULTADO: Mostrar credenciais geradas
SELECT
  n.email,
  n.password AS senha,
  n.user_id::text AS user_id
FROM new_user_data n;
