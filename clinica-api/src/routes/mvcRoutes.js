// src/routes/mvcRoutes.js
import express from "express";
import { MvcUsuarioController } from "../controllers/mvcUsuarioController.js";
import { MvcClinicaController } from "../controllers/mvcClinicaController.js";
import { MvcPacienteController } from "../controllers/mvcPacienteController.js";
import { MvcAgendamentoController } from "../controllers/mvcAgendamentoController.js";
import { ensureLoggedIn, ensureAdmin } from "../middlewares/auth.js";

const router = express.Router();

/* home */
router.get("/", (req, res) => res.render("index"));

/* auth */
router.get("/login", MvcUsuarioController.formLogin);
router.post("/login", MvcUsuarioController.login);
router.get("/logout", MvcUsuarioController.logout);

router.get("/register", MvcUsuarioController.formRegister);
router.post("/register", MvcUsuarioController.register);

/* dashboard */
router.get("/dashboard", ensureLoggedIn, MvcUsuarioController.dashboard);

/* clinicas (admin & clinica) */
router.get("/clinicas", ensureLoggedIn, MvcClinicaController.list);
router.get("/clinicas/new", ensureAdmin, MvcClinicaController.formCreate);
router.post("/clinicas", ensureAdmin, MvcClinicaController.create);
router.get("/clinicas/:id/edit", ensureAdmin, MvcClinicaController.formEdit);
router.put("/clinicas/:id", ensureAdmin, MvcClinicaController.update);
router.delete("/clinicas/:id", ensureAdmin, MvcClinicaController.delete);

/* pacientes (admin & clinica) */
router.get("/pacientes", ensureLoggedIn, MvcPacienteController.list);
router.get("/pacientes/new", ensureLoggedIn, MvcPacienteController.formCreate);
router.post("/pacientes", ensureLoggedIn, MvcPacienteController.create);
router.get("/pacientes/:id/edit", ensureLoggedIn, MvcPacienteController.formEdit);
router.put("/pacientes/:id", ensureLoggedIn, MvcPacienteController.update);
router.delete("/pacientes/:id", ensureLoggedIn, MvcPacienteController.delete);

/* agendamentos */
router.get("/agendamentos", ensureLoggedIn, MvcAgendamentoController.list);
router.get("/agendamentos/new", ensureLoggedIn, MvcAgendamentoController.formCreate);
router.post("/agendamentos", ensureLoggedIn, MvcAgendamentoController.create);
router.get("/agendamentos/:id/edit", ensureLoggedIn, MvcAgendamentoController.formEdit);
router.put("/agendamentos/:id", ensureLoggedIn, MvcAgendamentoController.update);
router.delete("/agendamentos/:id", ensureLoggedIn, MvcAgendamentoController.delete);

export default router;
