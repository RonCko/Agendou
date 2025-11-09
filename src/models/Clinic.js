const supabase = require('../config/supabase');

async function findById(id) {
  const { data, error } = await supabase
    .from('clinics')
    .select(`
      *,
      users!inner (*),
      clinic_specializations!inner (
        specializations!inner (
          name
        )
      ),
      availabilities (*)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  if (data) {
    // Remover senha dos dados do usuário
    const { password: _, ...userData } = data.users;
    data.users = userData;
  }
  
  return data;
}

async function findBySpecialization(specializationId) {
  const { data, error } = await supabase
    .from('clinic_specializations')
    .select(`
      clinics!inner (
        *,
        users!inner (
          name,
          email
        ),
        availabilities (*)
      )
    `)
    .eq('specialization_id', specializationId);
    
  if (error) throw error;
  return data?.map(item => item.clinics) || [];
}

async function findAll() {
  const { data, error } = await supabase
    .from('clinics')
    .select(`
      *,
      users!inner (
        name,
        email
      ),
      clinic_specializations!inner (
        specializations!inner (
          name
        )
      ),
      availabilities (*)
    `);
    
  if (error) throw error;
  return data || [];
}

async function getSpecializations() {
  const { data, error } = await supabase
    .from('specializations')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data || [];
}

async function addSpecialization(clinicId, specializationId) {
  const { error } = await supabase
    .from('clinic_specializations')
    .insert([{
      clinic_id: clinicId,
      specialization_id: specializationId
    }]);
    
  if (error) throw error;
}

async function removeSpecialization(clinicId, specializationId) {
  const { error } = await supabase
    .from('clinic_specializations')
    .delete()
    .eq('clinic_id', clinicId)
    .eq('specialization_id', specializationId);
    
  if (error) throw error;
}

module.exports = {
  findById,
  findBySpecialization,
  findAll,
  getSpecializations,
  addSpecialization,
  removeSpecialization
};