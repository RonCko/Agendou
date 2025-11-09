// src/controllers/mvcPacienteController.js
import { Paciente } from "../models/paciente.js";
import { Usuario } from "../models/usuario.js";
import bcrypt from "bcrypt";

export const MvcPacienteController = {
  async list(req, res) {
    try {
      const pacientes = await Paciente.findAll({
        include: {
          model: Usuario,
          attributes: ["nome", "email", "telefone", "tipo"]
        }
      });

      res.render("pacientes/list", {
        pacientes: pacientes.map(p => p.toJSON())
      });
    } catch (err) {
      console.error(err);
      req.flash("error", "Erro ao listar pacientes");
      res.redirect("/dashboard");
    }
  },

  formCreate(req, res) {
    res.render("pacientes/create");
  },

  async create(req, res) {
    try {
      const { nome, email, telefone, senha, cpf, data_nascimento } = req.body;

      // Cria usuário vinculado
      const hash = await bcrypt.hash(senha, 10);
      const usuario = await Usuario.create({
        nome,
        email,
        telefone,
        senha: hash,
        tipo: "paciente",
        ativo: true
      });

      // Cria paciente e associa corretamente (foreignKey usuario_id)
      await Paciente.create({
        cpf,
        data_nascimento,
        usuario_id: usuario.id
      });

      req.flash("success", "Paciente criado com sucesso");
      res.redirect("/pacientes");
    } catch (err) {
      console.error(err);
      req.flash("error", err.message);
      res.redirect("/pacientes/new");
    }
  },

  async formEdit(req, res) {
    try {
      const paciente = await Paciente.findByPk(req.params.id, { include: Usuario });
      if (!paciente || !paciente.Usuario) {
        req.flash("error", "Paciente não encontrado");
        return res.redirect("/pacientes");
      }
      res.render("pacientes/edit", { paciente: paciente.toJSON() });
    } catch (err) {
      console.error(err);
      req.flash("error", "Erro ao carregar paciente");
      res.redirect("/pacientes");
    }
  },

  async update(req, res) {
    try {
      const paciente = await Paciente.findByPk(req.params.id, { include: Usuario });
      if (!paciente || !paciente.Usuario) {
        req.flash("error", "Paciente não encontrado");
        return res.redirect("/pacientes");
      }

      const { nome, email, telefone, cpf, data_nascimento } = req.body;

      await paciente.update({ cpf, data_nascimento });
      await paciente.Usuario.update({ nome, email, telefone });

      req.flash("success", "Paciente atualizado com sucesso");
      res.redirect("/pacientes");
    } catch (err) {
      console.error(err);
      req.flash("error", err.message);
      res.redirect(`/pacientes/${req.params.id}/edit`);
    }
  },

  async delete(req, res) {
    try {
      const paciente = await Paciente.findByPk(req.params.id, { include: Usuario });
      if (!paciente || !paciente.Usuario) {
        req.flash("error", "Paciente não encontrado");
        return res.redirect("/pacientes");
      }

      await paciente.Usuario.destroy();
      await paciente.destroy();

      req.flash("success", "Paciente removido com sucesso");
      res.redirect("/pacientes");
    } catch (err) {
      console.error(err);
      req.flash("error", "Erro ao remover paciente");
      res.redirect("/pacientes");
    }
  }
};
