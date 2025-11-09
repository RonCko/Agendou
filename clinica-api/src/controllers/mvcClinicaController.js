// src/controllers/mvcClinicaController.js
import { Clinica } from "../models/clinica.js";
import { Usuario } from "../models/usuario.js";

export const MvcClinicaController = {
  async list(req, res) {
    // Busca todas as clínicas e inclui o usuário relacionado
    const clinicas = await Clinica.findAll({
      include: {
        model: Usuario,
        attributes: ["nome", "email", "tipo"]
      }
    });
    const clinicasJSON = clinicas.map(c => c.toJSON());

    res.render("clinicas/list", { clinicas: clinicasJSON });
  },

  formCreate(req, res) {
    res.render("clinicas/create");
  },

  async create(req, res) {
    try {
      await Clinica.create(req.body);
      req.flash("success", "Clínica criada");
      res.redirect("/clinicas");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/clinicas/new");
    }
  },

  async formEdit(req, res) {
    const clinica = await Clinica.findByPk(req.params.id, {
      include: {
        model: Usuario,
        attributes: ["nome", "email", "tipo"]
      }
    });

    if (!clinica) {
      req.flash("error", "Clínica não encontrada");
      return res.redirect("/clinicas");
    }

    res.render("clinicas/edit", { clinica: clinica.toJSON() });
  },

  async update(req, res) {
    const clinica = await Clinica.findByPk(req.params.id);
    if (!clinica) {
      req.flash("error", "Clínica não encontrada");
      return res.redirect("/clinicas");
    }

    await clinica.update(req.body);
    req.flash("success", "Clínica atualizada");
    res.redirect("/clinicas");
  },

  async delete(req, res) {
    const clinica = await Clinica.findByPk(req.params.id);
    if (!clinica) {
      req.flash("error", "Clínica não encontrada");
      return res.redirect("/clinicas");
    }

    await clinica.destroy();
    req.flash("success", "Clínica removida");
    res.redirect("/clinicas");
  }
};
