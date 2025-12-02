import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'

// Pages - Eager loading for public routes
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Clinicas from './pages/Clinicas'
import ClinicaDetalhes from './pages/ClinicaDetalhes'

// Pages - Lazy loading for authenticated routes
const MeusAgendamentos = lazy(() => import('./pages/MeusAgendamentos'))
const PainelClinica = lazy(() => import('./pages/PainelClinica'))
const NovoAgendamento = lazy(() => import('./pages/NovoAgendamento'))
const ConfiguracaoClinica = lazy(() => import('./pages/ConfiguracaoClinica'))
const DashboardClinica = lazy(() => import('./pages/DashboardClinica'))
const ConfiguracoesPerfil = lazy(() => import('./pages/ConfiguracoesPerfil'))

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Suspense fallback={<Loading />}>
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

            {/* Rotas protegidas - Ambos */}
            <Route 
              path="/configuracoes-perfil" 
              element={
                <ProtectedRoute allowedTypes={['paciente', 'clinica']}>
                  <ConfiguracoesPerfil />
                </ProtectedRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
