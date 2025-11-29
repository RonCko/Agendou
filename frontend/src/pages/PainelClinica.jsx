import { useState, useEffect } from 'react';
import { agendamentosAPI, clinicasAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function PainelClinica() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clinica, setClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroLoading, setFiltroLoading] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filtro, setFiltro] = useState('pendente');

  useEffect(() => {
    carregarDados();
  }, [filtro]);

  const carregarDados = async () => {
    try {
      setFiltroLoading(true);
      const [agendRes, clinicaRes] = await Promise.all([
        agendamentosAPI.listar({ status: filtro }),
        clinicasAPI.listar({ /* buscar clinica do usuario */ })
      ]);
      setAgendamentos(agendRes.data.agendamentos);
      // Assumir que a primeira clínica é a do usuário logado
      setClinica(clinicaRes.data.clinicas?.[0]);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
      setFiltroLoading(false);
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      setAtualizandoStatus(id);
      await agendamentosAPI.atualizar(id, { status: novoStatus });
      setMessage({ type: 'success', text: 'Status atualizado com sucesso' });
      carregarDados();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar status' });
    } finally {
      setAtualizandoStatus(null);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Painel da Clínica</h1>

      {clinica && (
        <div className="card mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{clinica.nome_fantasia}</h2>
          <p className="text-sm sm:text-base text-gray-600">{clinica.endereco}</p>
        </div>
      )}

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {['pendente', 'confirmado', 'realizado', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltro(status)}
              disabled={filtroLoading}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
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

      {/* Loading para filtros */}
      {filtroLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {!filtroLoading && agendamentos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base sm:text-lg">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agendamentos.map((agendamento) => (
            <div key={agendamento.id} className="card">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold">
                      {agendamento.paciente?.usuario?.nome}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(agendamento.status)} self-start`}>
                      {agendamento.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm sm:text-base text-gray-700">
                    <p>
                      <span className="font-medium">Especialização:</span>{' '}
                      {agendamento.especializacao?.nome}
                    </p>
                    <p>
                      <span className="font-medium">Data:</span>{' '}
                      {new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p>
                      <span className="font-medium">Horário:</span>{' '}
                      {agendamento.hora_agendamento}
                    </p>
                    <p className="text-xs sm:text-sm break-all">
                      <span className="font-medium">Contato:</span>{' '}
                      {agendamento.paciente?.usuario?.telefone} | {agendamento.paciente?.usuario?.email}
                    </p>
                    {agendamento.observacoes && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Observações:</span>{' '}
                        {agendamento.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-y-0 w-full sm:w-auto">
                  {agendamento.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => atualizarStatus(agendamento.id, 'confirmado')}
                        disabled={atualizandoStatus === agendamento.id}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {atualizandoStatus === agendamento.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Confirmar'
                        )}
                      </button>
                      <button
                        onClick={() => atualizarStatus(agendamento.id, 'cancelado')}
                        disabled={atualizandoStatus === agendamento.id}
                        className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {agendamento.status === 'confirmado' && (
                    <button
                      onClick={() => atualizarStatus(agendamento.id, 'realizado')}
                      disabled={atualizandoStatus === agendamento.id}
                      className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                    >
                      {atualizandoStatus === agendamento.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Marcar Realizado'
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
