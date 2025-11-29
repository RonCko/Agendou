-- Script para ajustar timezone das colunas timestamp no Supabase
-- Execute este script no SQL Editor do Supabase se quiser mudar o padrão do banco

-- Opção 1: Alterar timezone da sessão (temporário)
SET timezone = 'America/Sao_Paulo';

-- Opção 2: Alterar timezone do banco permanentemente (requer privilégios)
-- ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Verificar timezone atual
SHOW timezone;

-- Se quiser converter timestamps existentes de UTC para horário local nas consultas:
-- SELECT created_at AT TIME ZONE 'America/Sao_Paulo' FROM agendamentos;
