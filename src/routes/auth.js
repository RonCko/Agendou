const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Criar usuário de teste ao iniciar o servidor
User.createTestUser();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, specialization, address } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Pass through userType/specialization/address so clinics are created when requested
    const user = await User.create({ name, email, password, userType, specialization, address });
    const token = jwt.sign({ id: user.id, userType: user.user_type || user.userType || 'client' }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if this is a test user login attempt
    if (email === User.TEST_USER.email && password === User.TEST_USER.password) {
      const token = jwt.sign(
        { id: User.TEST_USER.id, isTestUser: true },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      return res.json({
        token,
        user: {
          id: User.TEST_USER.id,
          name: User.TEST_USER.name,
          email: User.TEST_USER.email,
          isTestUser: true
        }
      });
    }
    
    // Regular user login
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

  const token = jwt.sign({ id: user.id, userType: user.user_type || user.userType || 'client' }, process.env.JWT_SECRET);
    delete user.password;

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Retornar dados do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Rota simples para recuperação de senha (mock)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    // Aqui você pode integrar com nodemailer ou serviços externos para enviar email
    if (!user) {
      // Não revelar se o email existe por segurança
      return res.json({ message: 'Se o email existir, você receberá instruções para redefinir a senha.' });
    }
    // Mock: retornamos sucesso
    return res.json({ message: 'Se o email existir, você receberá instruções para redefinir a senha.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

module.exports = router;