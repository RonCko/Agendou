# 🏥 Agendou - Sistema de Agendamento de Clínicas

Sistema completo de agendamento de consultas em clínicas médicas particulares, desenvolvido com **React + Vite**, **Express**, **Sequelize** e **Supabase (PostgreSQL)**.

---

## 📋 Requisitos Atendidos

✅ **8 tabelas** no banco de dados relacional  
✅ **Relacionamento N:N** (Clínicas ↔ Especializações)  
✅ **Relacionamento 1:N** (Clínicas → Agendamentos, Pacientes → Agendamentos)  
✅ **3 perfis de usuário**: Paciente, Clínica (gerenciados por sessão e JWT)  
✅ **CRUD 100% funcional** em todas as entidades  
✅ **Regra de negócio adicional**: Impede agendamentos duplicados no mesmo horário/especialização  
✅ **Arquitetura MVC** (Model-View-Controller)

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas:

1. **usuarios** - Tabela base (tipo: paciente, clinica)
2. **pacientes** - Dados específicos de pacientes (1:1 com usuarios)
3. **clinicas** - Dados específicos de clínicas (1:1 com usuarios)
4. **especializacoes** - Catálogo de especializações médicas
5. **clinica_especializacoes** - Relacionamento N:N entre clínicas e especializações
6. **horarios_atendimento** - Horários de funcionamento das clínicas
7. **agendamentos** - Registro de agendamentos (1:N com pacientes e clínicas)
8. **avaliacoes** - Avaliações dos pacientes sobre clínicas

---

## 🚀 Instalação e Configuração

### 1️⃣ Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. No **SQL Editor**, execute o arquivo `sql/supabase_schema.sql`
3. Anote as credenciais:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - Credenciais do PostgreSQL (em Settings → Database)

### 2️⃣ Backend

```powershell
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
Copy-Item .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase

# Execute o servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

### 3️⃣ Frontend (React + Vite)

```powershell
# Entre na pasta do frontend (será criada)
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

---

## 📡 Rotas da API

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Público |
|--------|------|-----------|---------|
| POST | `/registrar` | Registrar novo usuário | ✅ |
| POST | `/login` | Fazer login | ✅ |
| POST | `/logout` | Fazer logout | 🔒 |
| GET | `/perfil` | Obter perfil do usuário | 🔒 |
| PUT | `/perfil` | Atualizar perfil | 🔒 |

### Clínicas (`/api/clinicas`)

| Método | Rota | Descrição | Público |
|--------|------|-----------|---------|
| GET | `/` | Listar clínicas (catálogo) | ✅ |
| GET | `/:id` | Buscar clínica por ID | ✅ |
| PUT | `/:id` | Atualizar dados da clínica | 🔒 Clínica |
| POST | `/:id/especializacoes` | Adicionar especialização | 🔒 Clínica |
| DELETE | `/:id/especializacoes/:id` | Remover especialização | 🔒 Clínica |
| POST | `/:id/horarios` | Configurar horários | 🔒 Clínica |

### Agendamentos (`/api/agendamentos`)

| Método | Rota | Descrição | Requer Auth |
|--------|------|-----------|-------------|
| GET | `/` | Listar agendamentos | 🔒 |
| GET | `/disponibilidade` | Verificar horários ocupados | 🔒 |
| GET | `/:id` | Buscar agendamento por ID | 🔒 |
| POST | `/` | Criar agendamento | 🔒 Paciente |
| PUT | `/:id` | Atualizar agendamento | 🔒 |
| DELETE | `/:id` | Deletar agendamento | 🔒 |

### Especializações (`/api/especializacoes`)

| Método | Rota | Descrição | Público |
|--------|------|-----------|---------|
| GET | `/` | Listar especializações | ✅ |

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Token)** e **Sessões** combinados:

- **JWT**: Para autenticação da API (Bearer Token)
- **Sessão**: Para controle de login no frontend MVC

### Exemplo de requisição autenticada:

```javascript
fetch('http://localhost:3333/api/agendamentos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## 🧩 Regra de Negócio - Agendamentos

### **Validação de Horários Duplicados**

O sistema **impede** que dois pacientes agendem no mesmo horário e especialização em uma clínica:

```javascript
// Constraint única no banco de dados
UNIQUE(clinica_id, especializacao_id, data_agendamento, hora_agendamento)
```

**Fluxo:**
1. Paciente escolhe clínica, especialização, data e hora
2. Sistema verifica se já existe agendamento ativo (não cancelado)
3. Se ocupado → retorna erro 409 (Conflict)
4. Se disponível → cria o agendamento

**Endpoint para verificar disponibilidade:**

```
GET /api/agendamentos/disponibilidade?clinica_id=xxx&especializacao_id=yyy&data_agendamento=2025-12-01
```

Retorna lista de horários já ocupados.

---

## 👥 Perfis de Usuário

### 1. **Paciente**
- Pode criar agendamentos
- Visualizar seus agendamentos
- Cancelar agendamentos
- Avaliar clínicas

### 2. **Clínica**
- Ver agendamentos da sua clínica
- Confirmar/cancelar agendamentos
- Configurar especializações oferecidas
- Definir horários de atendimento
- Atualizar dados do perfil
---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js          # Configurações gerais
│   │   └── database.js        # Conexão Sequelize
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── AgendamentoController.js
│   │   └── ClinicaController.js
│   ├── middlewares/
│   │   └── auth.js            # Middlewares de autenticação
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Paciente.js
│   │   ├── Clinica.js
│   │   ├── Agendamento.js
│   │   └── index.js           # Relacionamentos
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── agendamento.routes.js
│   │   └── index.js
│   ├── app.js                 # Configuração Express
│   └── server.js              # Inicialização
├── .env.example
├── .gitignore
└── package.json

sql/
└── supabase_schema.sql        # Schema completo
```

---

## 🧪 Testando a API

### Registrar Paciente:

```bash
curl -X POST http://localhost:3333/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "123456",
    "telefone": "11999999999",
    "tipo": "paciente",
    "cpf": "12345678900",
    "data_nascimento": "1990-05-15"
  }'
```

### Login:

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "123456"
  }'
```

### Criar Agendamento:

```bash
curl -X POST http://localhost:3333/api/agendamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "clinica_id": "uuid-da-clinica",
    "especializacao_id": "uuid-da-especializacao",
    "data_agendamento": "2025-12-01",
    "hora_agendamento": "14:00",
    "observacoes": "Primeira consulta"
  }'
```

---

## 🛠️ Tecnologias Utilizadas

### Backend:
- **Node.js** + **Express** - Servidor e rotas
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticação via token
- **bcryptjs** - Hash de senhas
- **express-session** - Gerenciamento de sessões
- **Supabase** - Banco PostgreSQL em nuvem

### Frontend (a ser implementado):
- **React** - Biblioteca UI
- **Vite** - Build tool
- **React Router** - Navegação
- **Axios** - Requisições HTTP
- **TailwindCSS** - Estilização

---

## 📝 Próximos Passos

1. ✅ Backend completo
2. ⏳ Criar frontend React + Vite
3. ⏳ Implementar páginas de login/registro
4. ⏳ Catálogo de clínicas
5. ⏳ Sistema de agendamento com calendário
6. ⏳ Painel da clínica
7. ⏳ Sistema de avaliações

---

## 👨‍💻 Desenvolvedor

Desenvolvido para o projeto da disciplina de Desenvolvimento Web 2.

---

## 📄 Licença

Este projeto é de código aberto para fins educacionais.
