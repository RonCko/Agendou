# 🎨 Agendou Frontend

Frontend do sistema Agendou desenvolvido com **React + Vite** e **TailwindCSS**.

## 🚀 Instalação

```powershell
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

## 📦 Tecnologias

- **React 18** - Biblioteca UI
- **Vite** - Build tool rápido
- **React Router** - Navegação SPA
- **Axios** - Cliente HTTP
- **TailwindCSS** - Framework CSS
- **Context API** - Gerenciamento de estado

## 🗂️ Estrutura

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Loading.jsx
│   │   └── Alert.jsx
│   ├── contexts/         # Context API
│   │   └── AuthContext.jsx
│   ├── pages/            # Páginas da aplicação
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Clinicas.jsx
│   │   ├── ClinicaDetalhes.jsx
│   │   ├── NovoAgendamento.jsx
│   │   ├── MeusAgendamentos.jsx
│   │   └── PainelClinica.jsx
│   ├── services/         # Integração com API
│   │   └── api.js
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Entry point
│   └── index.css         # Estilos globais
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login com JWT
- [x] Registro (Paciente e Clínica)
- [x] Logout
- [x] Proteção de rotas

### ✅ Catálogo de Clínicas
- [x] Listagem com filtros (cidade, especialização, busca)
- [x] Detalhes da clínica
- [x] Especializações e preços
- [x] Horários de atendimento

### ✅ Agendamentos (Paciente)
- [x] Criar agendamento
- [x] Verificação de horários disponíveis em tempo real
- [x] Validação de horários duplicados
- [x] Lista de meus agendamentos
- [x] Cancelar agendamento

### ✅ Painel da Clínica
- [x] Ver agendamentos recebidos
- [x] Confirmar/cancelar agendamentos
- [x] Marcar como realizado
- [x] Filtros por status

## 🔐 Autenticação

O sistema utiliza **JWT** armazenado no `localStorage`:

```javascript
// Login automático com token salvo
const token = localStorage.getItem('token');
// Enviado automaticamente em cada requisição via interceptor
```

## 🌐 Integração com Backend

O frontend está configurado para se comunicar com o backend em:
- **Desenvolvimento**: `http://localhost:3333/api`
- Proxy configurado no Vite para evitar CORS

## 📱 Páginas

### Públicas
- `/` - Home page
- `/login` - Login
- `/register` - Cadastro
- `/clinicas` - Catálogo de clínicas
- `/clinicas/:id` - Detalhes da clínica

### Protegidas (Paciente)
- `/meus-agendamentos` - Lista de agendamentos
- `/agendar/:clinicaId` - Novo agendamento

### Protegidas (Clínica)
- `/painel-clinica` - Painel de gerenciamento

## 🎨 Estilização

Utiliza **TailwindCSS** com classes utilitárias e componentes customizados:

```css
.btn-primary  /* Botão primário */
.btn-secondary  /* Botão secundário */
.input-field  /* Campo de input */
.card  /* Cartão com sombra */
```

## 🔄 Fluxo de Agendamento

1. Paciente busca clínicas
2. Seleciona clínica e visualiza especializações
3. Clica em "Agendar"
4. Escolhe especialização e data
5. Sistema mostra horários disponíveis (verificação em tempo real)
6. Horários ocupados aparecem desabilitados
7. Paciente seleciona horário disponível
8. Confirma agendamento
9. Clínica recebe no painel
10. Clínica confirma/cancela

## 🛠️ Scripts

```powershell
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
```

## ⚙️ Configuração

### Vite (vite.config.js)
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3333'  // Proxy para backend
  }
}
```

### Axios (src/services/api.js)
```javascript
baseURL: 'http://localhost:3333/api'
// Interceptor adiciona token automaticamente
```

## 🐛 Troubleshooting

### Erro CORS
- Verifique se o backend está rodando
- Backend já tem CORS configurado para `http://localhost:5173`

### Token expirado
- Sistema desloga automaticamente
- Redireciona para `/login`

### Horários não carregam
- Verifique se a clínica tem especializações cadastradas
- Backend precisa estar rodando

## 📝 TODO

- [ ] Sistema de avaliações
- [ ] Upload de imagens (foto perfil, clínica)
- [ ] Notificações em tempo real
- [ ] Chat entre paciente e clínica
- [ ] Histórico de consultas
- [ ] Relatórios para clínicas

---

**Desenvolvido com ❤️ usando React + Vite**
