const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Configurar horários de atendimento
router.post('/schedule', auth, async (req, res) => {
  try {
    const { workDays, startTime, endTime, appointmentDuration } = req.body;
    
    if (req.user.userType !== 'clinic') {
      return res.status(403).json({ error: 'Apenas clínicas podem configurar horários' });
    }

    await User.updateClinicSchedule(req.user.id, {
      workDays,
      startTime,
      endTime,
      appointmentDuration
    });

    res.json({ message: 'Horários atualizados com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar horários' });
  }
});

// Obter horários de atendimento
router.get('/schedule/:clinicId', auth, async (req, res) => {
  try {
    const schedule = await User.getClinicSchedule(req.params.clinicId);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar horários' });
  }
});

// Atualizar perfil da clínica
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, specialization, address } = req.body;
    
    if (req.user.userType !== 'clinic') {
      return res.status(403).json({ error: 'Apenas clínicas podem atualizar perfil' });
    }

    const updatedProfile = await User.updateClinicProfile(req.user.id, {
      name,
      specialization,
      address
    });

    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;