import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { Usuario } from '../models/index.js';

// Middleware para verificar JWT
export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        erro: 'Token não fornecido',
        mensagem: 'Você precisa estar autenticado para acessar este recurso'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['senha'] }
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ 
        erro: 'Usuário não encontrado ou inativo'
      });
    }

    req.usuario = usuario;
    req.usuarioId = usuario.id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    return res.status(500).json({ erro: 'Erro ao verificar autenticação' });
  }
};

// Middleware para verificar se usuário está logado (via sessão)
export const estaLogado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    req.usuarioSessao = req.session.usuario;
    return next();
  }
  
  return res.status(401).json({ 
    erro: 'Não autenticado',
    mensagem: 'Você precisa fazer login para acessar este recurso'
  });
};

// Middleware para verificar perfil de clínica
export const eClinica = (req, res, next) => {
  const usuario = req.usuario || req.usuarioSessao;
  
  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado' });
  }

  if (usuario.tipo !== 'clinica') {
    return res.status(403).json({ 
      erro: 'Acesso negado',
      mensagem: 'Apenas clínicas podem acessar este recurso'
    });
  }

  next();
};

// Middleware para verificar perfil de paciente
export const ePaciente = (req, res, next) => {
  const usuario = req.usuario || req.usuarioSessao;
  
  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado' });
  }

  if (usuario.tipo !== 'paciente') {
    return res.status(403).json({ 
      erro: 'Acesso negado',
      mensagem: 'Apenas pacientes podem acessar este recurso'
    });
  }

  next();
};

export default {
  verificarToken,
  estaLogado,
  eClinica,
  ePaciente
};
