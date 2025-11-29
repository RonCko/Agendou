import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Clinicas from './pages/Clinicas'
import ClinicaDetalhes from './pages/ClinicaDetalhes'
import MeusAgendamentos from './pages/MeusAgendamentos'
import PainelClinica from './pages/PainelClinica'
import NovoAgendamento from './pages/NovoAgendamento'
import ConfiguracaoClinica from './pages/ConfiguracaoClinica'
import DashboardClinica from './pages/DashboardClinica'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/clinicas" element={<Clinicas />} />
            <Route path="/clinicas/:id" element={<ClinicaDetalhes />} />

            {/* Rotas protegidas - Paciente */}
            <Route 
              path="/meus-agendamentos" 
              element={
                <ProtectedRoute allowedTypes={['paciente']}>
                  <MeusAgendamentos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agendar/:clinicaId" 
              element={
                <ProtectedRoute allowedTypes={['paciente']}>
                  <NovoAgendamento />
                </ProtectedRoute>
              } 
            />
            {/* Rotas protegidas - Clínica */}
            <Route 
              path="/painel-clinica" 
              element={
                <ProtectedRoute allowedTypes={['clinica']}>
                  <PainelClinica />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracao-clinica" 
              element={
                <ProtectedRoute allowedTypes={['clinica']}>
                  <ConfiguracaoClinica />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-clinica" 
              element={
                <ProtectedRoute allowedTypes={['clinica']}>
                  <DashboardClinica />
                </ProtectedRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
