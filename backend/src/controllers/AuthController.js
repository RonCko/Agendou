import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { Usuario, Paciente, Clinica, sequelize } from '../models/index.js';

class AuthController {
  // Registro de novo usuário
  async registrar(req, res) {
    const t = await sequelize.transaction();
    
    try {
      const { nome, email, senha, telefone, tipo, ...dadosExtras } = req.body;

      // Validações básicas
      if (!nome || !email || !senha || !tipo) {
        await t.rollback();
        return res.status(400).json({
          erro: 'Campos obrigatórios faltando',
          mensagem: 'Nome, email, senha e tipo são obrigatórios'
        });
      }

      if (!['paciente', 'clinica'].includes(tipo)) {
        await t.rollback();
        return res.status(400).json({
          erro: 'Tipo de usuário inválido',
          mensagem: 'Tipo deve ser: paciente ou clinica '
        });
      }

      // VALIDAR SENHA
      if (senha.length < 6 || !/[a-zA-Z]/.test(senha) || !/[0-9]/.test(senha)) {
        await t.rollback();
        return res.status(400).json({
          erro: 'Senha fraca',
          mensagem: 'A senha deve ter no mínimo 6 caracteres, incluindo letras e números'
        });
      }

      // Verificar se já existe usuário com esse email
      const usuarioExistente = await Usuario.findOne({ where: { email }, transaction: t });
      if (usuarioExistente) {
        await t.rollback();
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
        telefone: telefone || null,
        tipo,
        ativo: true
      }, { transaction: t });

      // Se for paciente, criar registro de paciente
      if (tipo === 'paciente') {
        const { cpf, data_nascimento, endereco } = dadosExtras;

        if (!cpf || !data_nascimento) {
          await t.rollback();
          return res.status(400).json({
            erro: 'Dados incompletos',
            mensagem: 'CPF e data de nascimento são obrigatórios para pacientes'
          });
        }

        await Paciente.create({
          usuario_id: usuario.id,
          cpf,
          data_nascimento,
          endereco: endereco || null
        }, { transaction: t });
      }

      // Se for clínica, criar registro de clínica
      if (tipo === 'clinica') {
        const { cnpj, nome_fantasia, descricao, endereco, cidade, estado, cep, telefone_comercial } = dadosExtras;
        
        if (!cnpj || !nome_fantasia || !endereco || !cidade || !estado) {
          await t.rollback();
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
        }, { transaction: t });
      }

      // Commit da transação
      await t.commit();

      // Buscar usuário com dados relacionados
      const usuarioCompleto = await Usuario.findByPk(usuario.id, {
        attributes: { exclude: ['senha'] },
        include: [
          { association: 'paciente' },
          { association: 'clinica', include: [{ association: 'especializacoes' }] }
        ]
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, tipo: usuario.tipo },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Preparar dados do usuário para retorno
      const dadosUsuario = {
        id: usuarioCompleto.id,
        nome: usuarioCompleto.nome,
        email: usuarioCompleto.email,
        tipo: usuarioCompleto.tipo,
        telefone: usuarioCompleto.telefone,
        foto_perfil: usuarioCompleto.foto_perfil,
        ativo: usuarioCompleto.ativo
      };

      // Adicionar dados específicos conforme o tipo
      if (usuarioCompleto.tipo === 'paciente' && usuarioCompleto.paciente) {
        dadosUsuario.paciente = {
          id: usuarioCompleto.paciente.id,
          cpf: usuarioCompleto.paciente.cpf,
          data_nascimento: usuarioCompleto.paciente.data_nascimento,
          endereco: usuarioCompleto.paciente.endereco
        };
      } else if (usuarioCompleto.tipo === 'clinica' && usuarioCompleto.clinica) {
        dadosUsuario.clinica = {
          id: usuarioCompleto.clinica.id,
          cnpj: usuarioCompleto.clinica.cnpj,
          nome_fantasia: usuarioCompleto.clinica.nome_fantasia,
          descricao: usuarioCompleto.clinica.descricao,
          endereco: usuarioCompleto.clinica.endereco,
          cidade: usuarioCompleto.clinica.cidade,
          estado: usuarioCompleto.clinica.estado,
          cep: usuarioCompleto.clinica.cep,
          telefone_comercial: usuarioCompleto.clinica.telefone_comercial,
          foto_capa: usuarioCompleto.clinica.foto_capa,
          ativo: usuarioCompleto.clinica.ativo,
          especializacoes: usuarioCompleto.clinica.especializacoes || []
        };
      }

      return res.status(201).json({
        mensagem: 'Usuário registrado com sucesso',
        token,
        usuario: dadosUsuario
      });
    } catch (error) {
      await t.rollback();
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

      // Buscar usuário com dados completos
      const usuario = await Usuario.findOne({ 
        where: { email },
        include: [
          { association: 'paciente' },
          { association: 'clinica', include: ['especializacoes'] }
        ]
      });
      
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

      // Preparar dados do usuário para retorno
      const dadosUsuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        telefone: usuario.telefone,
        foto_perfil: usuario.foto_perfil,
        ativo: usuario.ativo
      };

      // Adicionar dados específicos conforme o tipo
      if (usuario.tipo === 'paciente' && usuario.paciente) {
        dadosUsuario.paciente = {
          id: usuario.paciente.id,
          cpf: usuario.paciente.cpf,
          data_nascimento: usuario.paciente.data_nascimento,
          endereco: usuario.paciente.endereco
        };
      } else if (usuario.tipo === 'clinica' && usuario.clinica) {
        dadosUsuario.clinica = {
          id: usuario.clinica.id,
          cnpj: usuario.clinica.cnpj,
          nome_fantasia: usuario.clinica.nome_fantasia,
          descricao: usuario.clinica.descricao,
          endereco: usuario.clinica.endereco,
          cidade: usuario.clinica.cidade,
          estado: usuario.clinica.estado,
          cep: usuario.clinica.cep,
          telefone_comercial: usuario.clinica.telefone_comercial,
          foto_capa: usuario.clinica.foto_capa,
          ativo: usuario.clinica.ativo,
          especializacoes: usuario.clinica.especializacoes || []
        };
      }

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
        usuario: dadosUsuario
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
}

export default new AuthController();
