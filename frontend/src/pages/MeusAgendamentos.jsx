import { useState, useEffect } from 'react';
import { agendamentosAPI } from '../services/api';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { MapPin } from 'lucide-react';

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLoading, setFiltroLoading] = useState(false);
  const [cancelando, setCancelando] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    carregarAgendamentos();
  }, [filtro]);

  const carregarAgendamentos = async () => {
    try {
      setFiltroLoading(true);
      const params = filtro !== 'todos' ? { status: filtro } : {};
      const response = await agendamentosAPI.listar(params);
      setAgendamentos(response.data.agendamentos);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar agendamentos' });
    } finally {
      setLoading(false);
      setFiltroLoading(false);
    }
  };

  const cancelarAgendamento = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      setCancelando(id);
      await agendamentosAPI.atualizar(id, { status: 'cancelado' });
      setMessage({ type: 'success', text: 'Agendamento cancelado com sucesso' });
      carregarAgendamentos();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao cancelar agendamento' });
    } finally {
      setCancelando(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      realizado: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Meus Agendamentos</h1>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      {/* Filtros */}
      <div className="card mb-6">
        {filtroLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
        <div className="flex space-x-4">
          {['todos', 'pendente', 'confirmado', 'cancelado', 'realizado'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltro(status)}
              disabled={filtroLoading}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${filtroLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {agendamentos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agendamentos.map((agendamento) => (
            <div key={agendamento.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold">
                      {agendamento.clinica?.nome_fantasia}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(agendamento.status)}`}>
                      {agendamento.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-medium">Especialização:</span>{' '}
                      {agendamento.especializacao?.icone} {agendamento.especializacao?.nome}
                    </p>
                    <p>
                      <span className="font-medium">Data:</span>{' '}
                      {new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p>
                      <span className="font-medium">Horário:</span>{' '}
                      {agendamento.hora_agendamento}
                    </p>
                    {agendamento.medico_nome && (
                      <p>
                        <span className="font-medium">Médico:</span>{' '}
                        {agendamento.medico_nome}
                      </p>
                    )}
                    {agendamento.observacoes && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Observações:</span>{' '}
                        {agendamento.observacoes}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {agendamento.clinica?.endereco}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {agendamento.status === 'pendente' && (
                    <button
                      onClick={() => cancelarAgendamento(agendamento.id)}
                      disabled={cancelando === agendamento.id}
                      className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center ${
                        cancelando === agendamento.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {cancelando === agendamento.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cancelando...
                        </>
                      ) : (
                        'Cancelar'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
