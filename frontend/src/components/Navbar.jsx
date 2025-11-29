import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Hospital, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isPaciente, isClinica } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Hospital className="text-primary-600" size={28} />
              <span className="text-xl sm:text-2xl font-bold text-primary-600">Agendou</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {!isClinica && (
                <Link to="/clinicas" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Clínicas
                </Link>
              )}
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
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm hidden sm:block">
                  <p className="text-gray-700 font-medium">{user.nome}</p>
                  <p className="text-gray-500 text-xs capitalize">{user.tipo}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">
                  Cadastrar
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isClinica && (
              <Link 
                to="/clinicas" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                Clínicas
              </Link>
            )}
            {isPaciente && (
              <Link 
                to="/meus-agendamentos" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                Meus Agendamentos
              </Link>
            )}
            {isClinica && (
              <>
                <Link 
                  to="/dashboard-clinica" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/painel-clinica" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Agendamentos
                </Link>
                <Link 
                  to="/configuracao-clinica" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Configurações
                </Link>
              </>
            )}
            {isAuthenticated && (
              <div className="sm:hidden px-3 py-2 border-t border-gray-200 mt-2 pt-2">
                <p className="text-gray-700 font-medium">{user.nome}</p>
                <p className="text-gray-500 text-sm capitalize">{user.tipo}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
