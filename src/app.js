const express = require('express');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const clinicRoutes = require('./routes/clinic');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/clinic', authMiddleware, clinicRoutes);

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});