-- SQL gerado pelo supabase, a ordem de geração das tabelas pode ser diferente e causar erros se somente copiar e colar no sql editor.

CREATE TABLE public.agendamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  clinica_id uuid NOT NULL,
  especializacao_id uuid NOT NULL,
  data_agendamento date NOT NULL,
  hora_agendamento time without time zone NOT NULL,
  medico_nome character varying,
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pendente'::character varying, 'confirmado'::character varying, 'cancelado'::character varying, 'realizado'::character varying]::text[])),
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agendamentos_pkey PRIMARY KEY (id),
  CONSTRAINT agendamentos_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id),
  CONSTRAINT agendamentos_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id),
  CONSTRAINT agendamentos_especializacao_id_fkey FOREIGN KEY (especializacao_id) REFERENCES public.especializacoes(id)
);
CREATE TABLE public.clinica_especializacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  especializacao_id uuid NOT NULL,
  preco numeric,
  duracao_minutos integer DEFAULT 30,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clinica_especializacoes_pkey PRIMARY KEY (id),
  CONSTRAINT clinica_especializacoes_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id),
  CONSTRAINT clinica_especializacoes_especializacao_id_fkey FOREIGN KEY (especializacao_id) REFERENCES public.especializacoes(id)
);
CREATE TABLE public.clinicas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL UNIQUE,
  cnpj character varying NOT NULL UNIQUE,
  nome_fantasia character varying NOT NULL,
  descricao text,
  endereco text NOT NULL,
  cidade character varying NOT NULL,
  estado character varying NOT NULL,
  cep character varying,
  telefone_comercial character varying,
  foto_capa text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clinicas_pkey PRIMARY KEY (id),
  CONSTRAINT clinicas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.configuracao_horarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  especializacao_id uuid NOT NULL,
  dias_semana ARRAY NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fim time without time zone NOT NULL,
  duracao_slot integer NOT NULL DEFAULT 30,
  intervalo_almoco boolean DEFAULT false,
  hora_inicio_almoco time without time zone,
  hora_fim_almoco time without time zone,
  data_inicio date,
  data_fim date,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracao_horarios_pkey PRIMARY KEY (id),
  CONSTRAINT configuracao_horarios_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id),
  CONSTRAINT configuracao_horarios_especializacao_id_fkey FOREIGN KEY (especializacao_id) REFERENCES public.especializacoes(id)
);
CREATE TABLE public.especializacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL UNIQUE,
  descricao text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT especializacoes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.horarios_atendimento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  especializacao_id uuid NOT NULL,
  data_disponivel date NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fim time without time zone NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT horarios_atendimento_pkey PRIMARY KEY (id),
  CONSTRAINT horarios_atendimento_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id),
  CONSTRAINT horarios_atendimento_especializacao_id_fkey FOREIGN KEY (especializacao_id) REFERENCES public.especializacoes(id)
);
CREATE TABLE public.horarios_excecoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinica_id uuid NOT NULL,
  especializacao_id uuid NOT NULL,
  data_excecao date NOT NULL,
  hora_inicio time without time zone DEFAULT '00:00:00'::time without time zone,
  hora_fim time without time zone DEFAULT '23:59:00'::time without time zone,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['bloqueio'::character varying, 'feriado'::character varying, 'evento'::character varying, 'customizado'::character varying]::text[])),
  motivo text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT horarios_excecoes_pkey PRIMARY KEY (id),
  CONSTRAINT horarios_excecoes_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id),
  CONSTRAINT horarios_excecoes_especializacao_id_fkey FOREIGN KEY (especializacao_id) REFERENCES public.especializacoes(id)
);
CREATE TABLE public.pacientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL UNIQUE,
  cpf character varying NOT NULL UNIQUE,
  data_nascimento date NOT NULL,
  endereco text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pacientes_pkey PRIMARY KEY (id),
  CONSTRAINT pacientes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  senha character varying NOT NULL,
  telefone character varying,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['paciente'::character varying, 'clinica'::character varying, 'admin'::character varying]::text[])),
  ativo boolean DEFAULT true,
  foto_perfil text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);


--*** Relações entre tabelas ***

--usuarios 1---1 pacientes
--usuarios 1---1 clinicas

--clinicas 1---n clinica_especializacoes ---n especializacoes
--clinicas 1---n configuracao_horarios ---n especializacoes
--clinicas 1---n horarios_atendimento ---n especializacoes
--clinicas 1---n horarios_excecoes ---n especializacoes
--clinicas 1---n agendamentos

--pacientes 1---n agendamentos
--especializacoes 1---n agendamentos