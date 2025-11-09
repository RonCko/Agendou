// src/controllers/mvcAgendamentoController.js
import { Agendamento } from "../models/agendamento.js";
import { Paciente } from "../models/paciente.js";
import { Clinica } from "../models/clinica.js";

export const MvcAgendamentoController = {
  async list(req, res) {
    const agendamentos = await Agendamento.findAll({
      include: [
        { model: Paciente },
        { model: Clinica }
      ]
    });

    const agendamentosJSON = agendamentos.map(a => a.toJSON());
    res.render("agendamentos/list", { agendamentos: agendamentosJSON });
  },

  formCreate(req, res) {
    // Para criar um agendamento precisamos dos pacientes e clínicas
    const pacientes = Paciente.findAll();
    const clinicas = Clinica.findAll();
    Promise.all([pacientes, clinicas]).then(([pacientes, clinicas]) => {
      res.render("agendamentos/create", { pacientes: pacientes.map(p => p.toJSON()), clinicas: clinicas.map(c => c.toJSON()) });
    });
  },

  async create(req, res) {
    const { data, horario, pacienteId, clinicaId, medico } = req.body;

    // regra de negócio: impedir dois agendamentos no mesmo horário para o mesmo paciente
    const exists = await Agendamento.findOne({ where: { data, horario, pacienteId } });
    if (exists) {
      req.flash("error", "Paciente já tem um agendamento nesse dia/horário.");
      return res.redirect("/agendamentos/new");
    }

    await Agendamento.create({ data, horario, pacienteId, clinicaId, medico });
    req.flash("success", "Agendamento criado");
    res.redirect("/agendamentos");
  },

  async formEdit(req, res) {
    const agendamento = await Agendamento.findByPk(req.params.id, {
      include: [Paciente, Clinica]
    });

    const pacientes = await Paciente.findAll();
    const clinicas = await Clinica.findAll();

    if (!agendamento) {
      req.flash("error", "Agendamento não encontrado");
      return res.redirect("/agendamentos");
    }

    res.render("agendamentos/edit", {
      agendamento: agendamento.toJSON(),
      pacientes: pacientes.map(p => p.toJSON()),
      clinicas: clinicas.map(c => c.toJSON())
    });
  },

  async update(req, res) {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) {
      req.flash("error", "Agendamento não encontrado");
      return res.redirect("/agendamentos");
    }

    await agendamento.update(req.body);
    req.flash("success", "Agendamento atualizado");
    res.redirect("/agendamentos");
  },

  async delete(req, res) {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) {
      req.flash("error", "Agendamento não encontrado");
      return res.redirect("/agendamentos");
    }

    await agendamento.destroy();
    req.flash("success", "Agendamento removido");
    res.redirect("/agendamentos");
  }
};
