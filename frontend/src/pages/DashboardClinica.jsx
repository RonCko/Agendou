import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';

export default function DashboardClinica() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    try {
      const response = await dashboardAPI.clinica();
      setDados(response.data);
    } catch (error) {
      // Error silently handled
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;
  if (!dados) return <div>Erro ao carregar dashboard</div>;

  const { resumo, proximosAgendamentos, agendamentosPorEspecializacao, graficoUltimos30Dias } = dados;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard da Clínica</h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total de Agendamentos</p>
          <p className="text-3xl font-bold text-blue-600">{resumo.totalAgendamentos}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Agendamentos Este Mês</p>
          <p className="text-3xl font-bold text-green-600">{resumo.agendamentosMes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Agendamentos Hoje</p>
          <p className="text-3xl font-bold text-purple-600">{resumo.agendamentosHoje}</p>
        </div>
      </div>

      {/* Status dos Agendamentos */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Status dos Agendamentos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(resumo.agendamentosPorStatus || {}).map(([status, count]) => {
            const statusConfig = {
              pendente: { label: 'Pendentes', color: 'bg-yellow-500' },
              confirmado: { label: 'Confirmados', color: 'bg-blue-500' },
              realizado: { label: 'Realizados', color: 'bg-green-500' },
              cancelado: { label: 'Cancelados', color: 'bg-red-500' }
            };
            const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };
            return (
              <div key={status} className="text-center">
                <div className={`w-16 h-16 rounded-full ${config.color} mx-auto mb-2 flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
                <span className="text-sm text-gray-600">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Próximos Agendamentos */}
      {proximosAgendamentos && proximosAgendamentos.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
          <div className="space-y-3">
            {proximosAgendamentos.map(agendamento => (
              <div key={agendamento.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{agendamento.paciente?.usuario?.nome}</p>
                  <p className="text-sm text-gray-600">
                    {agendamento.especializacao?.nome} - {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')} às {agendamento.hora_agendamento}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  agendamento.status === 'confirmado' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {agendamento.status}
                </span>
              </div>
            ))}
          </div>
          <Link to="/painel-clinica" className="btn-primary mt-4 inline-block">
            Ver Todos os Agendamentos
          </Link>
        </div>
      )}

      {/* Agendamentos por Especialização */}
      {agendamentosPorEspecializacao && agendamentosPorEspecializacao.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Agendamentos por Especialização</h2>
          <div className="space-y-2">
            {agendamentosPorEspecializacao.map((item, index) => {
              const maxTotal = Math.max(...agendamentosPorEspecializacao.map(i => i.total));
              const percent = (item.total / maxTotal) * 100;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-40 text-sm">{item.especializacao}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percent}%` }}
                      >
                        <span className="text-white text-xs font-bold">{item.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico Últimos 30 Dias */}
      {graficoUltimos30Dias && graficoUltimos30Dias.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Agendamentos nos Últimos 30 Dias</h2>
          <div className="relative">
            {/* Gráfico de barras */}
            <div className="flex items-end justify-between gap-1 h-64 border-b-2 border-l-2 border-gray-300 pb-2 pl-2">
              {graficoUltimos30Dias.slice(-15).map((item, index) => {
                const maxTotal = Math.max(...graficoUltimos30Dias.map(i => parseInt(i.total)));
                const height = maxTotal > 0 ? (parseInt(item.total) / maxTotal) * 100 : 0;
                const minHeight = parseInt(item.total) > 0 ? 5 : 0; // Altura mínima para valores > 0
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {new Date(item.data_agendamento).toLocaleDateString('pt-BR')}: {item.total} agendamento{item.total !== '1' ? 's' : ''}
                    </div>
                    {/* Valor acima da barra */}
                    {parseInt(item.total) > 0 && (
                      <div className="text-xs font-bold mb-1 text-gray-700">{item.total}</div>
                    )}
                    {/* Barra */}
                    <div
                      className="bg-gradient-to-t from-blue-600 to-blue-400 w-full rounded-t hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer shadow-sm"
                      style={{ 
                        height: `${Math.max(height, minHeight)}%`,
                        minHeight: minHeight > 0 ? '8px' : '0'
                      }}
                    ></div>
                    {/* Data abaixo da barra */}
                    <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap w-12 h-12">
                      {new Date(item.data_agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legenda do eixo Y */}
            <div className="absolute left-0 top-0 bottom-14 flex flex-col justify-between text-xs text-gray-600 -ml-8">
              {[...Array(5)].map((_, i) => {
                const maxTotal = Math.max(...graficoUltimos30Dias.map(i => parseInt(i.total)));
                const value = Math.round((maxTotal * (4 - i)) / 4);
                return <span key={i}>{value}</span>;
              })}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6 text-center">
            Mostrando os últimos 15 dias com agendamentos
          </p>
        </div>
      )}

      {/* Link para Configurações */}
      <div className="mt-8 text-center">
        <Link to="/configuracao-clinica" className="btn-secondary">
          Configurar Clínica
        </Link>
      </div>
    </div>
  );
}
