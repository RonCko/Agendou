import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/registrar', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getPerfil: () => api.get('/auth/perfil'),
  updatePerfil: (data) => api.put('/auth/perfil', data)
};

// Clínicas
export const clinicasAPI = {
  listar: (params) => api.get('/clinicas', { params }),
  buscarPorId: (id) => api.get(`/clinicas/${id}`),
  atualizar: (id, data) => api.put(`/clinicas/${id}`, data),
  adicionarEspecializacao: (id, data) => api.post(`/clinicas/${id}/especializacoes`, data),
  removerEspecializacao: (id, especId) => api.delete(`/clinicas/${id}/especializacoes/${especId}`),
  // NOVA ARQUITETURA OTIMIZADA
  configurarHorariosRecorrentes: (id, data) => api.post(`/clinicas/${id}/horarios/configurar`, data),
  listarConfiguracoesHorarios: (id, params) => api.get(`/clinicas/${id}/horarios/configuracoes`, { params }),
  bloquearHorarios: (id, data) => api.post(`/clinicas/${id}/horarios/bloquear`, data),
  listarExcecoes: (id, params) => api.get(`/clinicas/${id}/horarios/excecoes`, { params }),
  removerExcecao: (id, excecaoId) => api.delete(`/clinicas/${id}/horarios/excecoes/${excecaoId}`)
};

// Agendamentos
export const agendamentosAPI = {
  listar: (params) => api.get('/agendamentos', { params }),
  buscarPorId: (id) => api.get(`/agendamentos/${id}`),
  criar: (data) => api.post('/agendamentos', data),
  atualizar: (id, data) => api.put(`/agendamentos/${id}`, data),
  deletar: (id) => api.delete(`/agendamentos/${id}`),
  verificarDisponibilidade: (params) => api.get('/agendamentos/disponibilidade', { params })
};

// Especializações
export const especializacoesAPI = {
  listar: () => api.get('/especializacoes')
};

// Upload
export const uploadAPI = {
  fotoPerfil: (formData) => api.post('/upload/perfil', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  fotoCapa: (clinicaId, formData) => api.post(`/upload/clinica/${clinicaId}/capa`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  galeria: (clinicaId, formData) => api.post(`/upload/clinica/${clinicaId}/galeria`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removerFotoGaleria: (clinicaId, fotoUrl) => api.delete(`/upload/clinica/${clinicaId}/galeria`, {
    data: { foto_url: fotoUrl }
  })
};

// Dashboard
export const dashboardAPI = {
  clinica: () => api.get('/dashboard/clinica'),
  paciente: () => api.get('/dashboard/paciente'),
  admin: () => api.get('/dashboard/admin')
};

export default api;
