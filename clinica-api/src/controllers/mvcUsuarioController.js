// src/controllers/mvcUsuarioController.js
import { Usuario } from "../models/usuario.js";
import bcrypt from "bcrypt";

export const MvcUsuarioController = {
  formLogin(req, res) {
    res.render("auth/login");
  },

  async login(req, res) {
    const { email, senha } = req.body;
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      req.flash("error", "Usuário não encontrado");
      return res.redirect("/login");
    }
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      req.flash("error", "Senha incorreta");
      return res.redirect("/login");
    }
    // armazenar dados básicos na sessão
    req.session.user = { id: user.id, nome: user.nome, tipo: user.tipo, email: user.email };
    req.flash("success", "Login efetuado com sucesso");
    return res.redirect("/dashboard");
  },

  async logout(req, res) {
    req.session.destroy(err => {
      res.redirect("/login");
    });
  },

  formRegister(req, res) {
    res.render("auth/register");
  },

  async register(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;
      const hash = await bcrypt.hash(senha, 10);
      await Usuario.create({ nome, email, senha: hash, tipo, ativo: true });
      req.flash("success", "Usuário criado, faça login.");
      res.redirect("/login");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  },

  dashboard(req, res) {
    res.render("dashboard", { user: req.session.user });
  }
};
