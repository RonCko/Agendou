import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

export default function DashboardClinica() {
  const { user } = useAuth();
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
      console.error('Erro ao carregar dashboard:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Status dos Agendamentos</h2>
          <div className="space-y-3">
            {Object.entries(resumo.agendamentosPorStatus || {}).map(([status, count]) => {
              const statusConfig = {
                pendente: { label: 'Pendentes', color: 'bg-yellow-500' },
                confirmado: { label: 'Confirmados', color: 'bg-blue-500' },
                realizado: { label: 'Realizados', color: 'bg-green-500' },
                cancelado: { label: 'Cancelados', color: 'bg-red-500' }
              };
              const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${config.color}`}></div>
                    <span>{config.label}</span>
                  </div>
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Receita Estimada</h2>
          <p className="text-4xl font-bold text-green-600 mb-2 flex items-center gap-2">
            <DollarSign size={36} />
            {parseFloat(resumo.receitaTotal || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Total de agendamentos realizados</p>
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
          <div className="flex items-end gap-2 h-64">
            {graficoUltimos30Dias.slice(-15).map((item, index) => {
              const maxTotal = Math.max(...graficoUltimos30Dias.map(i => parseInt(i.total)));
              const height = maxTotal > 0 ? (parseInt(item.total) / maxTotal) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs font-bold mb-1">{item.total}</div>
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2 transform rotate-45 origin-left whitespace-nowrap">
                    {new Date(item.data_agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
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
