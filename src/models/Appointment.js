const supabase = require('../config/supabase');

async function findByUser(userId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clinics (
        *,
        users (
          name
        )
      ),
      users (
        name
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

async function create({ userId, clinicId, date, notes }) {
  const appointmentData = {
    user_id: userId,
    clinic_id: clinicId,
    date,
    notes,
    created_at: new Date().toISOString(),
    status: 'scheduled' // 'scheduled', 'completed', 'cancelled'
  };
  
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select(`
      *,
      clinics (
        *,
        users (
          name
        )
      ),
      users (
        name
      )
    `)
    .single();
    
  if (error) throw error;
  return data;
}

async function remove(id, userId) {
  // Verificar se o agendamento pertence ao usuário
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
    
  if (fetchError || !appointment) return null;
  
  const { error: deleteError } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
    
  if (deleteError) throw deleteError;
  return appointment;
}

async function findByClinic(clinicId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      users (
        name,
        email
      )
    `)
    .eq('clinic_id', clinicId)
    .order('date', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

async function updateStatus(id, status, userId) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

module.exports = {
  findByUser,
  findByClinic,
  create,
  remove,
  updateStatus
};