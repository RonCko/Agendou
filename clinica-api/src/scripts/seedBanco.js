import { sequelize } from "../config/database.js";
import { Usuario } from "../models/usuario.js";
import { Paciente } from "../models/paciente.js";
import { Clinica } from "../models/clinica.js";
import { Agendamento } from "../models/agendamento.js";

async function seed() {
  try {
    console.log("🔄 Sincronizando banco de dados...");
    await sequelize.sync({ force: true }); // ⚠️ Apaga tudo e recria as tabelas

    console.log("👤 Criando usuários...");
    const usuarios = await Usuario.bulkCreate([
      { nome: "Admin Geral", email: "admin@clinica.com", senha: "admin123", tipo: "admin" },
      { nome: "Clínica São Lucas", email: "contato@saolucas.com", senha: "clinica123", tipo: "clinica" },
      { nome: "Clínica Bem Viver", email: "contato@bemviver.com", senha: "clinica456", tipo: "clinica" },
      { nome: "Carlos Souza", email: "carlos@paciente.com", senha: "123456", tipo: "paciente" },
      { nome: "Fernanda Lima", email: "fernanda@paciente.com", senha: "654321", tipo: "paciente" }
    ]);

    console.log("🏥 Criando clínicas...");
    const clinicas = await Clinica.bulkCreate([
      {
        cnpj: "12.345.678/0001-90",
        endereco: "Rua das Flores, 123",
        usuario_id: usuarios[1].id
      },
      {
        cnpj: "98.765.432/0001-10",
        endereco: "Av. Brasil, 789",
        usuario_id: usuarios[2].id
      }
    ]);

    console.log("🧍 Criando pacientes...");
    const pacientes = await Paciente.bulkCreate([
      {
        cpf: "12345678900",
        data_nascimento: "1990-05-12",
        usuario_id: usuarios[3].id
      },
      {
        cpf: "98765432100",
        data_nascimento: "1987-08-20",
        usuario_id: usuarios[4].id
      }
    ]);

    console.log("📅 Criando agendamentos...");
    await Agendamento.bulkCreate([
      {
        data: "2025-11-10",
        horario: "09:00",
        medico: "Dr. João Silva",
        paciente_id: pacientes[0].id,
        clinica_id: clinicas[0].id
      },
      {
        data: "2025-11-12",
        horario: "14:30",
        medico: "Dra. Ana Pereira",
        paciente_id: pacientes[1].id,
        clinica_id: clinicas[1].id
      }
    ]);

    console.log("✅ Banco populado com sucesso!");
    process.exit();
  } catch (erro) {
    console.error("❌ Erro ao popular banco:", erro);
    process.exit(1);
  }
}

seed();
