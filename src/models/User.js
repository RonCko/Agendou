const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Usuário de teste para desenvolvimento
const TEST_USER = {
  email: 'teste@teste.com',
  password: 'teste123',
  name: 'Usuário Teste'
};

async function createTestUser() {
  try {
    const exists = await findByEmail(TEST_USER.email);
    if (!exists) {
      console.log('Criando usuário de teste...');
      const created = await create(TEST_USER);
      // atribuir id ao TEST_USER para uso em login de teste
      TEST_USER.id = created.id;
      console.log('Usuário de teste criado com sucesso!');
      console.log('Email:', TEST_USER.email);
      console.log('Senha:', TEST_USER.password);
    } else {
      // garantir que TEST_USER tenha o id do usuário já existente
      TEST_USER.id = exists.id;
    }
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
  }
}

async function findByEmail(email) {
  // use maybeSingle so a non-existent user returns null instead of an error
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data; // will be null if not found
}

async function findById(id) {
  // maybeSingle avoids throwing when the id is not found
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function create({ name, email, password, userType, specialization, address }) {
  const hashedPassword = await bcrypt.hash(password, 8);
  
  const userData = {
    name,
    email,
    password: hashedPassword,
    user_type: userType || 'client', // 'client' ou 'clinic'
    created_at: new Date().toISOString()
  };

  // Primeiro criar o usuário
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (userError) throw userError;

  // Se for uma clínica, criar registro na tabela clinics
  if (userType === 'clinic') {
    const clinicData = {
      id: user.id,
      user_id: user.id,
      specialization,
      address
    };

    const { error: clinicError } = await supabase
      .from('clinics')
      .insert([clinicData]);

    if (clinicError) throw clinicError;
  }
  
  // Retornar dados sem senha
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function updateClinicSchedule(userId, scheduleData) {
  const { error } = await supabase
    .from('availabilities')
    .upsert([{
      clinic_id: userId,
      work_days: scheduleData.workDays,
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      appointment_duration: scheduleData.appointmentDuration
    }]);

  if (error) throw error;
}

async function getClinicSchedule(clinicId) {
  // use maybeSingle so missing schedule returns null instead of an error
  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (error) throw error;
  return data || {};
}

async function updateClinicProfile(userId, profileData) {
  // Atualizar dados do usuário
  const { data: user, error: userError } = await supabase
    .from('users')
    .update({ name: profileData.name })
    .eq('id', userId)
    .select()
    .single();

  if (userError) throw userError;

  // Atualizar dados da clínica
  const { error: clinicError } = await supabase
    .from('clinics')
    .update({
      specialization: profileData.specialization,
      address: profileData.address
    })
    .eq('user_id', userId);

  if (clinicError) throw clinicError;

  // Buscar dados atualizados
  const { data: clinic, error: fetchError } = await supabase
    .from('clinics')
    .select(`
      *,
      users (*)
    `)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Remover senha dos dados retornados
  const { password: _, ...userData } = clinic.users;
  return {
    ...userData,
    specialization: clinic.specialization,
    address: clinic.address
  };
}

module.exports = {
  findByEmail,
  findById,
  create,
  createTestUser,
  TEST_USER,
  updateClinicSchedule,
  getClinicSchedule,
  updateClinicProfile
};