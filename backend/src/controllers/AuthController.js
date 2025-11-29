import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { Usuario, Paciente, Clinica } from '../models/index.js';

class AuthController {
  // Registro de novo usuário
  async registrar(req, res) {
    try {
      const { nome, email, senha, telefone, tipo, ...dadosExtras } = req.body;

      // Validações básicas
      if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios faltando',
          mensagem: 'Nome, email, senha e tipo são obrigatórios'
        });
      }

      if (!['paciente', 'clinica', 'admin'].includes(tipo)) {
        return res.status(400).json({ 
          erro: 'Tipo de usuário inválido',
          mensagem: 'Tipo deve ser: paciente, clinica ou admin'
        });
      }

      // Verificar se já existe usuário com esse email
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ 
          erro: 'Email já cadastrado',
          mensagem: 'Este email já está em uso'
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar usuário
      const usuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        telefone,
        tipo,
        ativo: true
      });

      // Se for paciente, criar registro de paciente
      if (tipo === 'paciente') {
        const { cpf, data_nascimento, endereco } = dadosExtras;
        
        if (!cpf || !data_nascimento) {
          await usuario.destroy();
          return res.status(400).json({ 
            erro: 'Dados incompletos',
            mensagem: 'CPF e data de nascimento são obrigatórios para pacientes'
          });
        }

        await Paciente.create({
          usuario_id: usuario.id,
          cpf,
          data_nascimento,
          endereco
        });
      }

      // Se for clínica, criar registro de clínica
      if (tipo === 'clinica') {
        const { cnpj, nome_fantasia, descricao, endereco, cidade, estado, cep, telefone_comercial } = dadosExtras;
        
        if (!cnpj || !nome_fantasia || !endereco || !cidade || !estado) {
          await usuario.destroy();
          return res.status(400).json({ 
            erro: 'Dados incompletos',
            mensagem: 'CNPJ, nome fantasia, endereço, cidade e estado são obrigatórios para clínicas'
          });
        }

        await Clinica.create({
          usuario_id: usuario.id,
          cnpj,
          nome_fantasia,
          descricao,
          endereco,
          cidade,
          estado,
          cep,
          telefone_comercial,
          ativo: true
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, tipo: usuario.tipo },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.status(201).json({
        mensagem: 'Usuário registrado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return res.status(500).json({ 
        erro: 'Erro ao registrar usuário',
        mensagem: error.message
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios faltando',
          mensagem: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        return res.status(401).json({ 
          erro: 'Credenciais inválidas',
          mensagem: 'Email ou senha incorretos'
        });
      }

      if (!usuario.ativo) {
        return res.status(403).json({ 
          erro: 'Conta desativada',
          mensagem: 'Sua conta está desativada. Entre em contato com o suporte.'
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ 
          erro: 'Credenciais inválidas',
          mensagem: 'Email ou senha incorretos'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, tipo: usuario.tipo },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Salvar na sessão também
      req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      };

      return res.status(200).json({
        mensagem: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          telefone: usuario.telefone,
          foto_perfil: usuario.foto_perfil
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ 
        erro: 'Erro ao fazer login',
        mensagem: error.message
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ erro: 'Erro ao fazer logout' });
        }
        return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao fazer logout' });
    }
  }

  // Obter perfil do usuário logado
  async perfil(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.usuarioId, {
        attributes: { exclude: ['senha'] },
        include: [
          { association: 'paciente' },
          { association: 'clinica' }
        ]
      });

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      return res.status(200).json({ usuario });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
  }

  // Atualizar perfil
  async atualizarPerfil(req, res) {
    try {
      const { nome, telefone, foto_perfil, senha_atual, senha_nova } = req.body;
      
      const usuario = await Usuario.findByPk(req.usuarioId);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Se quiser alterar senha
      if (senha_atual && senha_nova) {
        const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
        
        if (!senhaValida) {
          return res.status(400).json({ 
            erro: 'Senha atual incorreta' 
          });
        }

        usuario.senha = await bcrypt.hash(senha_nova, 10);
      }

      // Atualizar outros campos
      if (nome) usuario.nome = nome;
      if (telefone) usuario.telefone = telefone;
      if (foto_perfil) usuario.foto_perfil = foto_perfil;

      await usuario.save();

      return res.status(200).json({
        mensagem: 'Perfil atualizado com sucesso',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          foto_perfil: usuario.foto_perfil,
          tipo: usuario.tipo
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
    }
  }
}

export default new AuthController();
