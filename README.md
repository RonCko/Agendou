# 🏥 Agendou - Sistema de Agendamento de Clínicas

Sistema completo de agendamento de consultas médicas desenvolvido com **React**, **Node.js**, **Express**, **Sequelize** e **PostgreSQL (Supabase)**.

## Documentação da API com Swagger

**Acesse a documentação interativa:** http://localhost:3333/api-docs (após iniciar o backend)

✅ Teste todos os endpoints  
✅ Exemplos prontos de requisição/resposta  
✅ Não precisa configurar nada!  

---

## **Como rodar a aplicação**

**1. Instalar dependências:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**2. Configurar variáveis de ambiente:**
```bash
# backend/.env
cp backend/.env.example backend/.env
# Edite com suas credenciais do Supabase
```

**3. Iniciar servidores:**

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Rodando em http://localhost:3333
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Rodando em http://localhost:5173
```

**4. Acessar:** http://localhost:5173

---

## 📋 Funcionalidades Principais

### ✅ Autenticação e Autorização
- Cadastro e login com JWT
- 2 tipos de usuário: Paciente, Clínica
- Sessões persistentes
- Rotas protegidas por tipo

### ✅ Gestão de Clínicas
- CRUD completo de clínicas
- Catálogo público com busca e filtros
- Perfil detalhado com especializações
- Sistema de horários de atendimento

### ✅ Agendamentos
- Criação de agendamentos com validação
- Verificação de disponibilidade
- **Regra de negócio**: Bloqueio de horários duplicados
- Gerenciamento de status (pendente, confirmado, realizado, cancelado)

### ✅ **1. Configuração da Clínica** 
- Painel completo de configurações
- Adicionar/remover especializações com preço
- Configurar horários de atendimento
- Upload de foto de capa

### ✅ **2. Upload de Fotos** 
- Upload de foto de capa (clínicas)
- Validação: apenas imagens até 5MB

### ✅ **3. Dashboard com Estatísticas** 
- **Dashboard Clínica**:
  - Total de agendamentos, receita estimada
  - Gráfico de status dos agendamentos
  - Agendamentos por especialização
  - Gráfico dos últimos 30 dias
  - Próximos agendamentos
  

### ✅ **4. Filtros Avançados** 
- Busca por nome/descrição
- Filtro por cidade e estado
- Filtro por especialização
- Faixa de preço (min/max)
- Ordenação: nome, preço, avaliação
- Paginação funcional

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** 4.18.2
- **Sequelize** 6.35.2 (ORM)
- **PostgreSQL** via Supabase
- **JWT** para autenticação
- **Bcrypt** para hashing de senhas
- **Multer** para upload de arquivos
- **CORS** para comunicação frontend/backend

### Frontend
- **React** 18.2.0
- **Vite** 5.0.8 (build tool)
- **React Router** 6.20.0
- **Axios** 1.6.2
- **TailwindCSS** 3.3.6
- **Context API** (gerenciamento de estado)

### Banco de Dados
- **PostgreSQL** (Supabase)
- **8 Tabelas** relacionadas
- **Relacionamentos**: 1:1, 1:N, N:N
- **Views** e **Triggers**

---

## Estrutura do Projeto

```
Agendou/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações (DB, upload, etc)
│   │   ├── controllers/    # Lógica de negócio (7 controllers)
│   │   ├── middlewares/    # Auth, validações
│   │   ├── models/         # Modelos Sequelize (8 models)
│   │   ├── routes/         # Rotas da API (7 routers)
│   │   ├── app.js          # Configuração Express
│   │   └── server.js       # Inicialização do servidor
│   ├── uploads/            # Arquivos enviados
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis (8)
│   │   ├── contexts/       # Context API (Auth)
│   │   ├── pages/          # Páginas React (14)
│   │   ├── services/       # APIs (5 services)
│   │   ├── App.jsx         # Rotas principais
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── sql/
│   └── supabase_schema.sql # Schema completo do banco
│
└── README.md
```

---

## Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Usuários base (nome, email, senha, tipo) |
| `pacientes` | Dados específicos de pacientes (CPF, data_nascimento) |
| `clinicas` | Dados das clínicas (CNPJ, endereço, foto_capa) |
| `especializacoes` | Especialidades médicas |
| `clinica_especializacoes` | **Relação N:N** (clinica ↔ especializacao) |
| `horarios_atendimento` | Horários por dia da semana |
| `agendamentos` | Consultas agendadas |
| `avaliacoes` | Avaliações de clínicas (1-5 estrelas) |

### Relacionamentos
- `usuarios` → `pacientes` (1:1)
- `usuarios` → `clinicas` (1:1)
- `clinicas` ↔ `especializacoes` (N:N via `clinica_especializacoes`)
- `clinicas` → `agendamentos` (1:N)
- `pacientes` → `agendamentos` (1:N)
- `clinicas` → `avaliacoes` (1:N)

---

## Autenticação e Autorização

### Sistema Dual
- **JWT** para API (Bearer Token)
- **Sessions** para persistência

### Middlewares
- `verificarToken`: Valida JWT
- `ePaciente`: Apenas pacientes
- `eClinica`: Apenas clínicas

---

## Endpoints da API

### Autenticação
```
POST   /api/auth/registrar
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/perfil
PUT    /api/auth/perfil
```

### Clínicas
```
GET    /api/clinicas                    # Listar (com filtros)
GET    /api/clinicas/:id               # Detalhes
PUT    /api/clinicas/:id               # Atualizar
POST   /api/clinicas/:id/especializacoes
DELETE /api/clinicas/:id/especializacoes/:especId
POST   /api/clinicas/:id/horarios
```

### Agendamentos
```
GET    /api/agendamentos               # Listar
POST   /api/agendamentos               # Criar
PUT    /api/agendamentos/:id           # Atualizar
DELETE /api/agendamentos/:id           # Cancelar
GET    /api/agendamentos/disponibilidade
```

### Upload
```
POST   /api/upload/clinica/:id/capa    # Foto de capa

```

---

## Frontend - Páginas

| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Home | Público |
| `/login` | Login | Público |
| `/register` | Cadastro | Público |
| `/clinicas` | Catálogo de Clínicas | Público |
| `/clinicas/:id` | Detalhes da Clínica | Público |
| `/dashboard-paciente` | Dashboard Paciente  | Paciente |
| `/meus-agendamentos` | Meus Agendamentos | Paciente |
| `/agendar/:id` | Novo Agendamento | Paciente |
| `/dashboard-clinica` | Dashboard Clínica  | Clínica |
| `/painel-clinica` | Gerenciar Agendamentos | Clínica |
| `/configuracao-clinica` | Configurações  | Clínica |

---

## Como Testar

### 1. Criar uma Clínica
```
1. Cadastre-se como "Clínica"
2. Acesse /configuracao-clinica
3. Configure: dados, especializações, horários, foto
```

### 2. Criar um Paciente
```
1. Cadastre-se como "Paciente"
2. Acesse /clinicas
3. Escolha uma clínica
4. Faça um agendamento
```

### 3. Testar Filtros
```
1. Acesse /clinicas
2. Use os filtros:
   - Busca: "Clínica"
   - Cidade: "São Paulo"
   - Especialização: "Cardiologia"
   - Preço: 100 a 300
   - Ordenar: "Melhor avaliadas"
3. Clique em "Buscar"
```

### 4. Ver Dashboard
```
# Como Clínica:
- /dashboard-clinica → Estatísticas completas
```

---

## 📝 Regras de Negócio

### 1. Agendamentos
- ✅ Não permite agendamentos duplicados (mesma clínica + especialização + data + hora)
- ✅ Validação de horários disponíveis em tempo real
- ✅ Apenas pacientes podem agendar
- ✅ Clínicas podem confirmar/cancelar/marcar como realizado

### 3. Upload de Fotos
- ✅ Apenas imagens (jpg, png, gif, webp)
- ✅ Tamanho máximo: 5MB
- ✅ Nomes únicos (evita sobrescrita)
- ✅ Remove foto antiga ao fazer novo upload

---

## Problemas Comuns

### Backend não conecta ao Supabase
```bash
# Verifique o .env:
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543  # Connection Pooling
DB_USER=postgres.SEU_PROJETO_ID
```

### Erro de CORS
```bash
# Verifique se o backend está rodando na porta 3333
# Frontend deve estar em http://localhost:5173
```

### Upload não funciona
```bash
# Verifique se a pasta uploads/ existe
# Permissões: deve ser gravável
# Tamanho: máximo 5MB
```

---

## Documentação

### Swagger (Documentação Interativa da API)
Acesse a documentação interativa completa com possibilidade de testar todos os endpoints diretamente no navegador:

**URL:** http://localhost:3333/api-docs

**Recursos:**
- ✅ Visualizar todos os endpoints
- ✅ Testar requisições diretamente
- ✅ Exemplos de request/response
- ✅ Autenticação com JWT
- ✅ Modelos de dados completos
---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## Status do Projeto

✅ **100% Funcional**

- ✅ Backend completo com endpoints
- ✅ Frontend responsivo com 14 páginas
- ✅ Sistema de autenticação JWT + Sessions
- ✅ CRUD completo para todas as entidades
- ✅ Upload de fotos com Multer
- ✅ Dashboards com estatísticas e gráficos
- ✅ Filtros avançados com paginação
- ✅ Regras de negócio implementadas
- ✅ Arquitetura MVC
- ✅ Documentação completa

---

**Desenvolvido usando React, Node.js e Supabase**

Plataforma simples de agendamento de consultas — backend em Node.js/Express e banco de dados hospedado no Supabase (Postgres).

Este repositório contém o código do servidor, frontend estático (em `public/`) e scripts úteis para testar e migrar dados.

## Recursos principais
- Registro e login (clientes e clínicas)
- Cadastro de clínicas, especializações e disponibilidade
- Agendamento, listagem, confirmação e cancelamento de consultas

## Estrutura do projeto

## Pré-requisitos
- Node.js 18+ (recomendo a versão LTS)
- Conta no Supabase com um projeto criado

## Configurar Supabase

1. Crie um projeto em https://app.supabase.com
2. No projeto do Supabase, abra `Project Settings` → `API` e copie:
	 - `Project URL` → coloque em `SUPABASE_URL`
	 - `service_role` key → coloque em `SUPABASE_KEY` (MANTENHA-SE SECRETA)
3. No Supabase SQL Editor execute o script `sql/supabase_schema.sql` para criar as tabelas e dados iniciais.

## Variáveis de ambiente

Renomeie o arquivo `.env.example` para `.env` e preencha os valores:

```
PORT=3000
JWT_SECRET=uma_chave_secreta_para_jwt
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_KEY=<service_role_key>
```
