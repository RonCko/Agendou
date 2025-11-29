# 🎯 Guia de Uso - Agendou v2.0

## 🚀 Como Iniciar

### Windows (PowerShell)
```powershell
# Opção 1: Script automático
.\iniciar.ps1

# Opção 2: Manual
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

---

## 📱 Fluxos de Uso

### 👤 Como Paciente

#### 1. Cadastro
1. Acesse http://localhost:5173/register
2. Selecione "Sou Paciente"
3. Preencha: nome, email, senha, telefone, CPF, data de nascimento
4. Clique em "Criar Conta"

#### 2. Buscar Clínicas
1. Acesse "Clínicas" no menu
2. Use os filtros:
   - **Busca**: digite o nome da clínica
   - **Cidade**: ex: "São Paulo"
   - **Estado**: selecione "SP"
   - **Especialização**: ex: "Cardiologia"
   - **Preço**: min 100, max 300
   - **Ordenar**: "Melhor avaliadas"
3. Clique em "🔍 Buscar"

#### 3. Agendar Consulta
1. Clique em uma clínica
2. Veja detalhes: especialidades, horários, avaliações
3. Clique em "Agendar Consulta"
4. Selecione:
   - Especialização
   - Data (hoje ou futuro)
   - Horário disponível (os ocupados ficam desabilitados)
5. Clique em "Confirmar Agendamento"

#### 4. Ver Meus Agendamentos
1. Menu → "Meus Agendamentos"
2. Filtre por status:
   - Todos
   - Pendente
   - Confirmado
   - Cancelado
   - Realizado
3. Pode cancelar agendamentos pendentes

#### 5. Dashboard
1. Menu → "Dashboard"
2. Veja:
   - Total de consultas
   - Status das consultas
   - Próximas consultas (detalhadas)
   - Histórico recente
   - Avaliações pendentes

#### 6. Avaliar Clínica
1. Acesse uma clínica
2. Role até "Avaliações"
3. Clique em "Avaliar Clínica"
4. Dê nota de 1-5 estrelas
5. Escreva um comentário (opcional)
6. Clique em "Enviar Avaliação"

---

### 🏥 Como Clínica

#### 1. Cadastro
1. Acesse http://localhost:5173/register
2. Selecione "Sou Clínica"
3. Preencha: nome, email, senha, telefone, CNPJ, nome fantasia, endereço completo
4. Clique em "Criar Conta"

#### 2. Configurar Clínica (Primeira vez)
1. Menu → "Configurações"
2. **Aba Dados Básicos**:
   - Preencha descrição
   - Atualize endereço completo
   - Telefone comercial
   - Clique em "Salvar Dados"

3. **Aba Especializações**:
   - Selecione uma especialização
   - Digite o preço (ex: 150.00)
   - Digite duração em minutos (ex: 30)
   - Clique em "Adicionar"
   - Repita para todas as especializações oferecidas

4. **Aba Horários**:
   - Marque os dias de funcionamento
   - Configure horário início e fim para cada dia
   - Clique em "Salvar Horários"

5. **Aba Fotos**:
   - Clique em "Escolher arquivo"
   - Selecione uma imagem (máx 5MB)
   - A foto será carregada automaticamente

#### 3. Dashboard
1. Menu → "Dashboard"
2. Veja:
   - **Cards de resumo**:
     - Total de agendamentos
     - Agendamentos este mês
     - Agendamentos hoje
     - Média de avaliações
   - **Status dos agendamentos** (gráfico)
   - **Receita estimada**
   - **Próximos agendamentos** (5 próximos)
   - **Agendamentos por especialização** (gráfico de barras)
   - **Gráfico dos últimos 30 dias**

#### 4. Gerenciar Agendamentos
1. Menu → "Agendamentos" (ou "Painel")
2. Filtre por status
3. Para cada agendamento:
   - **Pendente**: pode Confirmar ou Cancelar
   - **Confirmado**: pode Cancelar ou Marcar como Realizado
4. Veja dados do paciente: nome, telefone

#### 5. Ver Avaliações
1. Menu → "Dashboard"
2. Veja "Média de Avaliações"
3. Ou acesse sua página pública de clínica
4. Role até "Avaliações" para ver todas

---

## 🎨 Funcionalidades Específicas

### Upload de Fotos

**Foto de Perfil (Qualquer usuário)**:
```
1. (Futuro) Clique no seu nome no menu
2. Configurações de Perfil
3. Upload foto
```

**Foto de Capa (Clínica)**:
```
1. Menu → Configurações
2. Aba "Fotos"
3. Escolher arquivo
4. Foto aparece na página da clínica
```

### Filtros Avançados

**Cenários de Uso**:

**Cenário 1: Buscar cardiologista em SP até R$ 200**
```
- Especialização: Cardiologia
- Estado: SP
- Preço máx: 200
- Ordenar: Melhor avaliadas
→ Buscar
```

**Cenário 2: Buscar clínicas em Campinas**
```
- Cidade: Campinas
- Estado: SP
→ Buscar
```

**Cenário 3: Ver todas ordenadas por preço**
```
- Ordenar: Preço
→ Buscar
```

### Sistema de Avaliações

**Regras**:
- ✅ Apenas pacientes podem avaliar
- ✅ 1 avaliação por paciente/clínica
- ✅ Nota obrigatória (1-5 estrelas)
- ✅ Comentário opcional

**Estatísticas Calculadas**:
- Média geral
- Distribuição por nota (1-5)
- Total de avaliações

### Dashboards

**Clínica - Métricas**:
- Total de agendamentos (histórico)
- Agendamentos este mês
- Agendamentos hoje
- Status: pendente, confirmado, realizado, cancelado
- Receita total estimada (agendamentos realizados)
- Próximos 5 agendamentos
- Gráfico por especialização
- Gráfico últimos 30 dias

**Paciente - Métricas**:
- Total de consultas
- Status das consultas
- Próximas consultas (data, hora, local)
- Histórico recente
- Avaliações pendentes

---

## 🧪 Casos de Teste

### Teste 1: Agendamento Duplicado (Regra de Negócio)
```
1. Login como Paciente A
2. Agende: Clínica X → Cardiologia → 2024-01-15 → 10:00
3. Login como Paciente B
4. Tente agendar: Clínica X → Cardiologia → 2024-01-15 → 10:00
✅ Resultado: Horário aparece como OCUPADO (botão desabilitado)
```

### Teste 2: Avaliação Única
```
1. Login como Paciente A
2. Avalie Clínica X com 5 estrelas
3. Tente avaliar novamente a Clínica X
✅ Resultado: Erro "Você já avaliou esta clínica"
```

### Teste 3: Upload de Arquivo Grande
```
1. Login como Clínica
2. Configurações → Fotos
3. Tente fazer upload de arquivo > 5MB
✅ Resultado: Erro "Arquivo muito grande"
```

### Teste 4: Filtro por Preço
```
1. Acesse /clinicas
2. Preço mín: 100, Preço máx: 200
3. Buscar
✅ Resultado: Apenas clínicas com serviços entre R$ 100-200
```

### Teste 5: Paginação
```
1. Se houver mais de 12 clínicas
2. Aparecerão botões de paginação
3. Clique em "Próximo"
✅ Resultado: Carrega próximas 12 clínicas
```

---

## 🔧 Configurações Importantes

### Backend (.env)
```env
# Supabase (Connection Pooling)
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.SEU_PROJETO_ID
DB_PASSWORD=SUA_SENHA

# JWT
JWT_SECRET=seu_secret_aqui
JWT_EXPIRES_IN=7d

# Sessão
SESSION_SECRET=outro_secret_aqui

# Servidor
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (vite.config.js)
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3333',
      changeOrigin: true
    }
  }
}
```

---

## 📊 Dados de Teste

### Usuários Exemplo

**Clínica 1**:
```
Email: clinica@teste.com
Senha: 123456
Tipo: Clínica
Nome: Dr. Silva
```

**Paciente 1**:
```
Email: joao@teste.com
Senha: 123456
Tipo: Paciente
Nome: João Silva
```

### Especializações Padrão
(Cadastradas via SQL)
1. Cardiologia
2. Dermatologia
3. Ortopedia
4. Pediatria
5. Psiquiatria

---

## 🐛 Troubleshooting

### Problema: "ENOENT getaddrinfo"
**Solução**: Use Connection Pooling do Supabase (porta 6543)

### Problema: "Cannot alter type of column"
**Solução**: Backend já configurado com `sync: false, alter: false`

### Problema: Imagem não aparece
**Solução**: 
- Verifique se backend está servindo `/uploads`
- URL correta: `http://localhost:3333/uploads/filename.jpg`

### Problema: Filtros não funcionam
**Solução**:
- Verifique se há clínicas cadastradas
- Clique em "Limpar Filtros" e teste novamente

---

## 📚 Próximos Passos

Após dominar o sistema, considere:
1. Implementar perfil de Admin
2. Relatórios em PDF
3. Notificações em tempo real
4. Chat entre paciente e clínica
5. Integração com pagamento

---

**Desenvolvido com ❤️ - Sistema completo e funcional!**
