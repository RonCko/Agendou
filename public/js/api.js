// Wrapper para chamadas à API
const api = {
    async call(endpoint, { method = 'GET', body } = {}) {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro na requisição');
        }

        return response.json();
    },

    // Auth
    login: (email, password) => 
        api.call('/auth/login', { method: 'POST', body: { email, password } }),
    
    register: (name, email, password) =>
        api.call('/auth/register', { method: 'POST', body: { name, email, password } }),

    // Appointments
    getAppointments: () => 
        api.call('/appointments'),
    
    createAppointment: (appointment) =>
        api.call('/appointments', { method: 'POST', body: appointment }),
    
    deleteAppointment: (id) =>
        api.call(`/appointments/${id}`, { method: 'DELETE' })
};