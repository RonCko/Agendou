import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Hospital } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isPaciente, isClinica } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Hospital className="text-primary-600" size={28} />
              <span className="text-2xl font-bold text-primary-600">Agendou</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/clinicas" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Clínicas
              </Link>
              {isPaciente && (
                <>
                  <Link to="/meus-agendamentos" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Meus Agendamentos
                  </Link>
                </>
              )}
              {isClinica && (
                <>
                  <Link to="/dashboard-clinica" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/painel-clinica" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Agendamentos
                  </Link>
                  <Link to="/configuracao-clinica" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Configurações
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm">
                  <p className="text-gray-700 font-medium">{user.nome}</p>
                  <p className="text-gray-500 text-xs capitalize">{user.tipo}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
