const supabase = require('../src/config/supabase');

async function test() {
  try {
    const { data, error } = await supabase
      .from('specializations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar specializations:', error.message || error);
      process.exit(1);
    }

    console.log('Specializations:');
    console.table(data);
    process.exit(0);
  } catch (err) {
    console.error('Erro inesperado:', err);
    process.exit(1);
  }
}

if (require.main === module) test();

module.exports = { test };