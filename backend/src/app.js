import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import config from './config/config.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ========================================
// MIDDLEWARES
// ========================================

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Sessão
app.use(session(config.session));

// Logs de requisições (apenas em desenvolvimento)
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ========================================
// DOCUMENTAÇÃO SWAGGER
// ========================================

// Swagger UI - apenas na porta 3333
app.use('/api-docs', (req, res, next) => {
  const host = req.get('host');
  const port = host ? host.split(':')[1] : null;
  
  if (port !== '3333') {
    return res.status(404).json({ 
      erro: 'Não encontrado',
      mensagem: 'A documentação da API está disponível apenas em http://localhost:3333/api-docs'
    });
  }
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Agendou - Documentação',
  customfavIcon: 'https://swagger.io/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
}));

// Swagger JSON - apenas na porta 3333
app.get('/api-docs.json', (req, res) => {
  const host = req.get('host');
  const port = host ? host.split(':')[1] : null;
  
  if (port !== '3333') {
    return res.status(404).json({ 
      erro: 'Não encontrado',
      mensagem: 'A documentação da API está disponível apenas em http://localhost:3333/api-docs'
    });
  }
  
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========================================
// ROTAS
// ========================================

app.use('/api', routes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    mensagem: `A rota ${req.method} ${req.path} não existe`
  });
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    mensagem: config.server.env === 'development' ? error.message : 'Ocorreu um erro inesperado'
  });
});

export default app;
