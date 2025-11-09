# Agendou

Plataforma simples de agendamento de consultas — backend em Node.js/Express e banco de dados hospedado no Supabase (Postgres).

Este repositório contém o código do servidor, frontend estático (em `public/`) e scripts úteis para testar e migrar dados.

## Recursos principais
- Registro e login (clientes e clínicas)
- Cadastro de clínicas, especializações e disponibilidade
- Agendamento, listagem, confirmação e cancelamento de consultas

## Estrutura do projeto

Agendou/
- `src/` — servidor Express, routes e models
	- `app.js` — entrada do servidor
	- `config/supabase.js` — inicialização do cliente Supabase
	- `routes/` — rotas (auth, appointments, clinic, ...)
	- `models/` — lógica de acesso a dados (User, Appointment, Clinic)
- `public/` — frontend estático (HTML/JS/CSS)
- `sql/` — scripts SQL (ex.: `sql/supabase_schema.sql`)
- `scripts/` — pequenos testes/diagnósticos (`test_supabase.js`, `test_register.js`)
- `http_requests/` — coleção de requisições HTTP para testes (`agendou_requests.http`)
- `.env.example` — template de variáveis de ambiente

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

IMPORTANTE: não comite o `.env` em repositórios públicos. A `SUPABASE_KEY` aqui é a `service_role` e tem privilégios administrativos — só deve ser usada no servidor.

## Instalar dependências

No Windows (cmd.EXE):

```cmd
npm install
```

Se quiser garantir que pacotes antigas do Firebase sejam removidos:

```cmd
npm uninstall firebase-admin || echo skip
npm install
```

## Rodar em desenvolvimento

```cmd
npm run dev
```

O servidor inicializará em `http://localhost:3000` por padrão.

## Testes e utilitários

- Testar conexão com Supabase / listar specializations:

```cmd
node scripts/test_supabase.js
```

- Testar registro automático (cliente + clínica):

```cmd
node scripts/test_register.js
```

- Coleção de requisições para VS Code REST Client / Postman está em `http_requests/agendou_requests.http`.

## Fluxo de verificação manual (rápido)

1. Execute `npm run dev`.
2. Abra `http_requests/agendou_requests.http` no VS Code e use os exemplos para registrar um cliente e uma clínica.
3. Faça login com a clínica, copie o `token` retornado e use-o para chamar `/api/clinic/schedule` (salvar horários).
4. Verifique a tabela `availabilities` no Supabase Table Editor.

## Remoção do Firebase

Este repositório foi migrado de Firebase Realtime Database para Supabase (Postgres). Arquivos de configuração do Firebase foram removidos/neutralizados e o `package.json` não lista mais `firebase-admin`.

Se houver artefatos locais (por exemplo, arquivos JSON com credenciais do Firebase), apague-os do projeto e do histórico sensível.

## Migração de dados (opcional)

Se você precisa migrar dados do Firebase para Supabase, eu posso gerar um script que:
- exporta os dados do Firebase em JSON,
- transforma os registros ao formato das tabelas Postgres,
- insere os dados no Supabase via `@supabase/supabase-js` (usando `service_role` key).

Peça que eu gere o script se quiser seguir com a migração — precisarei do dump JSON ou acesso ao Realtime Database export.

## Troubleshooting rápido

- Erro PGRST116 (cannot coerce result to single JSON object): usamos `.maybeSingle()` em consultas onde a linha pode não existir. Se aparecer, olhe a query e verifique se o registro existe no Supabase.
- Token inválido / 401: verifique se você forneceu o header `Authorization: Bearer <TOKEN>` e se o token foi gerado com a mesma `JWT_SECRET` do `.env`.
- Erro de FK ao criar clinic/availability: verifique se `clinics` foi criado com `id` igual ao `users.id` (por compatibilidade com o frontend atual) ou ajuste frontend para usar `clinics.id`.

## Próximos passos sugeridos

- (opcional) Gerar Postman collection exportável
- (opcional) Gerar script de migração automática dos dados do Firebase
- Configurar RLS (Row Level Security) no Supabase e trocar chamadas públicas para `anon` key + políticas mais seguras

## Contato

Se quiser que eu gere a collection do Postman, o script de migração ou reforçar logs/validações nas rotas, diga qual item prefere e eu adiciono os arquivos.

---
Gerado automaticamente durante a migração para Supabase — adapte conforme necessário.