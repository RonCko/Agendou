-- ========================================
-- SCHEMA DO BANCO DE DADOS - AGENDOU
-- Sistema de Agendamento de Clínicas Médicas
-- Supabase (PostgreSQL)
-- Execute no Supabase SQL Editor (Dashboard -> SQL Editor)
-- ========================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. TABELA DE USUÁRIOS (Base para Pacientes e Clínicas)
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('paciente', 'clinica', 'admin')),
    ativo BOOLEAN DEFAULT true,
    foto_perfil TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. TABELA DE PACIENTES (Relacionamento 1:1 com Usuários)
-- ========================================
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    endereco TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. TABELA DE CLÍNICAS (Relacionamento 1:1 com Usuários)
-- ========================================
CREATE TABLE IF NOT EXISTS clinicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco TEXT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10),
    telefone_comercial VARCHAR(20),
    foto_capa TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. TABELA DE ESPECIALIZAÇÕES MÉDICAS
-- ========================================
CREATE TABLE IF NOT EXISTS especializacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 5. TABELA DE RELACIONAMENTO N:N
-- Clínicas x Especializações (Uma clínica pode ter várias especializações)
-- ========================================
CREATE TABLE IF NOT EXISTS clinica_especializacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    especializacao_id UUID NOT NULL REFERENCES especializacoes(id) ON DELETE CASCADE,
    preco DECIMAL(10, 2),
    duracao_minutos INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinica_id, especializacao_id)
);

-- ========================================
-- 6. TABELA DE HORÁRIOS DE ATENDIMENTO DAS CLÍNICAS
-- ========================================
CREATE TABLE IF NOT EXISTS horarios_atendimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinica_id, dia_semana, hora_inicio)
);

-- ========================================
-- 7. TABELA DE AGENDAMENTOS (Relacionamento 1:N)
-- Um paciente pode ter vários agendamentos
-- Uma clínica pode ter vários agendamentos
-- ========================================
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    especializacao_id UUID NOT NULL REFERENCES especializacoes(id),
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    medico_nome VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'realizado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- REGRA DE NEGÓCIO: Constraint para evitar agendamentos duplicados no mesmo horário
    UNIQUE(clinica_id, especializacao_id, data_agendamento, hora_agendamento)
);

-- ========================================
-- 8. TABELA DE AVALIAÇÕES (Relacionamento 1:N)
-- Pacientes podem avaliar clínicas
-- ========================================
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Um paciente só pode avaliar uma clínica uma vez por agendamento
    UNIQUE(paciente_id, agendamento_id)
);

-- ========================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_usuario ON pacientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clinicas_cnpj ON clinicas(cnpj);
CREATE INDEX IF NOT EXISTS idx_clinicas_usuario ON clinicas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clinicas_cidade ON clinicas(cidade);
CREATE INDEX IF NOT EXISTS idx_clinicas_ativo ON clinicas(ativo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_clinica ON agendamentos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_clinica_espec_clinica ON clinica_especializacoes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_horarios_clinica ON horarios_atendimento(clinica_id);

-- ========================================
-- DADOS INICIAIS - ESPECIALIZAÇÕES
-- ========================================
INSERT INTO especializacoes (nome, descricao, icone) VALUES
('Cardiologia', 'Especialidade médica que cuida do coração'),
('Dermatologia', 'Especialidade médica que cuida da pele'),
('Ortopedia', 'Especialidade médica que cuida dos ossos e articulações'),
('Pediatria', 'Especialidade médica que cuida de crianças'),
('Ginecologia', 'Especialidade médica que cuida da saúde da mulher'),
('Oftalmologia', 'Especialidade médica que cuida dos olhos'),
('Odontologia', 'Especialidade que cuida da saúde bucal'),
('Psicologia', 'Especialidade que cuida da saúde mental'),
('Nutrição', 'Especialidade que cuida da alimentação e nutrição'),
('Fisioterapia', 'Especialidade que cuida da reabilitação física')
ON CONFLICT (nome) DO NOTHING;

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pacientes_updated_at ON pacientes;
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinicas_updated_at ON clinicas;
CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_horarios_updated_at ON horarios_atendimento;
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON horarios_atendimento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_avaliacoes_updated_at ON avaliacoes;
CREATE TRIGGER update_avaliacoes_updated_at BEFORE UPDATE ON avaliacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS ÚTEIS PARA CONSULTAS
-- ========================================

-- View para listar agendamentos com informações completas
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT 
    a.id,
    a.data_agendamento,
    a.hora_agendamento,
    a.status,
    a.medico_nome,
    a.observacoes,
    p.cpf AS paciente_cpf,
    up.nome AS paciente_nome,
    up.telefone AS paciente_telefone,
    up.email AS paciente_email,
    c.nome_fantasia AS clinica_nome,
    c.endereco AS clinica_endereco,
    c.telefone_comercial AS clinica_telefone,
    e.nome AS especializacao_nome,
    ce.preco,
    ce.duracao_minutos,
    a.created_at,
    a.updated_at
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN usuarios up ON p.usuario_id = up.id
JOIN clinicas c ON a.clinica_id = c.id
JOIN especializacoes e ON a.especializacao_id = e.id
LEFT JOIN clinica_especializacoes ce ON c.id = ce.clinica_id AND e.id = ce.especializacao_id;

-- View para listar clínicas com suas especializações e avaliações
CREATE OR REPLACE VIEW vw_clinicas_especializacoes AS
SELECT 
    c.id AS clinica_id,
    c.nome_fantasia,
    c.descricao,
    c.cidade,
    c.estado,
    c.endereco,
    c.telefone_comercial,
    c.foto_capa,
    c.ativo,
    e.id AS especializacao_id,
    e.nome AS especializacao_nome,
    e.icone AS especializacao_icone,
    ce.preco,
    ce.duracao_minutos,
    COALESCE(AVG(av.nota), 0) AS media_avaliacoes,
    COUNT(DISTINCT av.id) AS total_avaliacoes
FROM clinicas c
JOIN clinica_especializacoes ce ON c.id = ce.clinica_id
JOIN especializacoes e ON ce.especializacao_id = e.id
LEFT JOIN avaliacoes av ON c.id = av.clinica_id
WHERE c.ativo = true AND ce.ativo = true
GROUP BY c.id, c.nome_fantasia, c.descricao, c.cidade, c.estado, c.endereco, 
         c.telefone_comercial, c.foto_capa, c.ativo, e.id, e.nome, e.icone, ce.preco, ce.duracao_minutos;

-- ========================================
-- COMENTÁRIOS NAS TABELAS
-- ========================================
COMMENT ON TABLE usuarios IS 'Tabela base para todos os tipos de usuários (pacientes, clínicas, admin)';
COMMENT ON TABLE pacientes IS 'Informações específicas de pacientes (1:1 com usuários)';
COMMENT ON TABLE clinicas IS 'Informações específicas de clínicas (1:1 com usuários)';
COMMENT ON TABLE especializacoes IS 'Catálogo de especializações médicas disponíveis';
COMMENT ON TABLE clinica_especializacoes IS 'Relacionamento N:N entre clínicas e especializações';
COMMENT ON TABLE horarios_atendimento IS 'Horários de funcionamento das clínicas por dia da semana';
COMMENT ON TABLE agendamentos IS 'Registro de todos os agendamentos realizados';
COMMENT ON TABLE avaliacoes IS 'Avaliações dos pacientes sobre as clínicas';

-- ========================================
-- RESUMO DO SCHEMA
-- ========================================
-- ✅ 8 TABELAS criadas
-- ✅ Relacionamento 1:N (Clínicas -> Agendamentos, Pacientes -> Agendamentos)
-- ✅ Relacionamento N:N (Clínicas <-> Especializações via clinica_especializacoes)
-- ✅ 3 perfis de usuário (paciente, clinica, admin)
-- ✅ CRUD completo possível em todas as entidades
-- ✅ REGRA DE NEGÓCIO: UNIQUE constraint em agendamentos evita duplicação de horário/especialização
-- ✅ Índices para performance
-- ✅ Triggers para auditoria (updated_at)
-- ✅ Views para consultas complexas
-- ========================================
