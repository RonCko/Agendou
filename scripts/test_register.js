// Test registration (client + clinic) against local server
// Requires Node 18+ (global fetch). Run: node scripts/test_register.js

const base = 'http://localhost:3000/api/auth';

async function run() {
  try {
    // Client
    const clientPayload = {
      name: 'Cliente Teste',
      email: 'cliente.teste@example.com',
      password: 'teste123',
      userType: 'client'
    };

    let r = await fetch(`${base}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientPayload)
    });
    console.log('Client register status:', r.status);
    console.log('Client response:', await r.text());

    // Clinic
    const clinicPayload = {
      name: 'Clínica Teste',
      email: 'clinica.teste@example.com',
      password: 'teste123',
      userType: 'clinic',
      specialization: 'Dermatology',
      address: { street: 'Rua A', city: 'Cidade' }
    };

    r = await fetch(`${base}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clinicPayload)
    });
    console.log('Clinic register status:', r.status);
    console.log('Clinic response:', await r.text());

  } catch (err) {
    console.error('Error testing registration:', err);
  }
}

run();