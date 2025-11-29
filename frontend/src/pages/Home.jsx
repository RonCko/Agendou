import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Calendar, CheckCircle } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Agende sua consulta com facilidade
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Encontre clínicas médicas particulares e agende online
            </p>
            <div className="flex justify-center space-x-4">
              {isAuthenticated ? (
                <Link to="/clinicas" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Ver Clínicas
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Começar Agora
                  </Link>
                  <Link to="/login" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition border-2 border-white">
                    Entrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Busque Clínicas</h3>
            <p className="text-gray-600">
              Encontre clínicas por especialização, localização e avaliações
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Agende Online</h3>
            <p className="text-gray-600">
              Escolha data e horário disponível de forma rápida e fácil
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Confirme</h3>
            <p className="text-gray-600">
              Receba confirmação e gerencie seus agendamentos
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Você é uma clínica?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Cadastre-se e comece a receber agendamentos online
          </p>
          <Link to="/register" className="btn-primary text-lg">
            Cadastrar Clínica
          </Link>
        </div>
      </div>
    </div>
  );
}
