const router = require('express').Router();
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.findByUser(req.user.id);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patientName, date, notes } = req.body;
    const appointment = await Appointment.create({
      userId: req.user.id,
      patientName,
      date,
      notes
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.remove(req.params.id, req.user.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover agendamento' });
  }
});

module.exports = router;