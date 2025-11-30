import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clinicasAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import { MapPin, Phone, DollarSign } from 'lucide-react';

export default function ClinicaDetalhes() {
  const { id } = useParams();
  const { isPaciente, isAuthenticated } = useAuth();
  const [clinica, setClinica] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarClinica();
  }, [id]);

  const carregarClinica = async () => {
    try {
      const response = await clinicasAPI.buscarPorId(id);
      setClinica(response.data.clinica);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!clinica) return <div className="text-center py-12">Clínica não encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="card mb-8">
        {clinica.foto_capa && (
          <img
            src={`http://localhost:3333${clinica.foto_capa}`}
            alt={clinica.nome_fantasia}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        <h1 className="text-4xl font-bold mb-4">{clinica.nome_fantasia}</h1>
        <div className="flex items-center text-gray-600 space-x-4 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={16} />
            {clinica.endereco}
          </span>
          {clinica.telefone_comercial && (
            <span className="flex items-center gap-1">
              <Phone size={16} />
              {clinica.telefone_comercial}
            </span>
          )}
        </div>
        {clinica.descricao && (
          <p className="text-gray-700 mb-6">{clinica.descricao}</p>
        )}
        {isPaciente && isAuthenticated && (
          <Link to={`/agendar/${clinica.id}`} className="btn-primary inline-block">
            Agendar Consulta
          </Link>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="btn-primary inline-block">
            Faça login para agendar
          </Link>
        )}
      </div>

      {/* Especializações */}
      {clinica.especializacoes && clinica.especializacoes.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Especializações Oferecidas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {clinica.especializacoes.map((esp) => (
              <div key={esp.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {esp.icone} {esp.nome}
                    </h3>
                    {esp.ClinicaEspecializacao?.duracao_minutos && (
                      <p className="text-sm text-gray-600">
                        Duração: {esp.ClinicaEspecializacao.duracao_minutos} min
                      </p>
                    )}
                  </div>
                  {esp.ClinicaEspecializacao?.preco && (
                    <div className="text-primary-600 font-bold text-lg flex items-center gap-1">
                      <DollarSign size={18} />
                      {parseFloat(esp.ClinicaEspecializacao.preco).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
