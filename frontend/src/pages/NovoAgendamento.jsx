import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clinicasAPI, agendamentosAPI } from '../services/api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

export default function NovoAgendamento() {
  const { clinicaId } = useParams();
  const navigate = useNavigate();
  const [clinica, setClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    especializacao_id: '',
    data_agendamento: '',
    hora_agendamento: '',
    observacoes: ''
  });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [datasDisponiveis, setDatasDisponiveis] = useState(new Set());
  const [carregandoDatas, setCarregandoDatas] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(new Date());

  useEffect(() => {
    carregarClinica();
  }, [clinicaId]);

  useEffect(() => {
    if (formData.especializacao_id) {
      carregarDatasDisponiveis();
    } else {
      setDatasDisponiveis(new Set());
    }
  }, [formData.especializacao_id]);

  useEffect(() => {
    if (formData.especializacao_id && formData.data_agendamento) {
      verificarDisponibilidade();
    }
  }, [formData.especializacao_id, formData.data_agendamento]);

  const carregarClinica = async () => {
    try {
      const response = await clinicasAPI.buscarPorId(clinicaId);
      setClinica(response.data.clinica);
    } catch (error) {
      setError('Erro ao carregar clínica');
    } finally {
      setLoading(false);
    }
  };

  const carregarDatasDisponiveis = async () => {
    setCarregandoDatas(true);
    try {
      const diasDisponiveis = new Set();
      const hoje = new Date();
      
      // Criar array de promessas para fazer requisições em paralelo
      const promessas = [];
      
      for (let i = 0; i < 60; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() + i);
        
        // Converter para string no formato YYYY-MM-DD usando o timezone local
        const year = data.getFullYear();
        const month = String(data.getMonth() + 1).padStart(2, '0');
        const day = String(data.getDate()).padStart(2, '0');
        const dataStr = `${year}-${month}-${day}`;
        
        // Criar promessa para cada dia
        const promessa = agendamentosAPI.verificarDisponibilidade({
          clinica_id: clinicaId,
          especializacao_id: formData.especializacao_id,
          data_agendamento: dataStr
        }).then((response) => {
          if (response.data.horariosDisponiveis && response.data.horariosDisponiveis.length > 0) {
            return dataStr;
          }
          return null;
        }).catch(() => null);
        
        promessas.push(promessa);
      }
      
      // Aguardar todas as promessas
      const resultados = await Promise.all(promessas);
      
      // Filtrar resultados nulos e adicionar ao Set
      resultados.forEach(data => {
        if (data) diasDisponiveis.add(data);
      });
      
      setDatasDisponiveis(diasDisponiveis);
    } catch (error) {
      console.error('Erro ao carregar datas disponíveis:', error);
    } finally {
      setCarregandoDatas(false);
    }
  };

  const verificarDisponibilidade = async () => {
    try {
      const response = await agendamentosAPI.verificarDisponibilidade({
        clinica_id: clinicaId,
        especializacao_id: formData.especializacao_id,
        data_agendamento: formData.data_agendamento
      });
      setHorariosDisponiveis(response.data.horariosDisponiveis || []);
      setHorariosOcupados(response.data.horariosOcupados || []);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      setHorariosDisponiveis([]);
      setHorariosOcupados([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await agendamentosAPI.criar({
        ...formData,
        clinica_id: clinicaId
      });
      setSuccess('Agendamento criado com sucesso!');
      setTimeout(() => navigate('/meus-agendamentos'), 2000);
    } catch (error) {
      setError(error.response?.data?.mensagem || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  // Função para gerar dias do calendário
  const gerarDiasDoMes = () => {
    const ano = mesSelecionado.getFullYear();
    const mes = mesSelecionado.getMonth();
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    // Último dia do mês
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    // Índice do primeiro dia (0 = domingo)
    const inicioSemana = primeiroDia.getDay();
    // Total de dias no mês
    const diasNoMes = ultimoDia.getDate();
    
    const dias = [];
    
    // Adicionar dias vazios do mês anterior
    for (let i = 0; i < inicioSemana; i++) {
      dias.push(null);
    }
    
    // Adicionar dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    
    return dias;
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDataDisponivel = (data) => {
    // Converter a data para string no formato YYYY-MM-DD usando o timezone local
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    const dataStr = `${year}-${month}-${day}`;
    return datasDisponiveis.has(dataStr);
  };

  const isDataPassada = (data) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return data < hoje;
  };

  const handleMesAnterior = () => {
    setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() - 1));
  };

  const handleProximoMes = () => {
    setMesSelecionado(new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1));
  };

  const handleSelecionarDia = (data) => {
    // Converter para string no formato YYYY-MM-DD usando o timezone local
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    const dataStr = `${year}-${month}-${day}`;
    setFormData({ ...formData, data_agendamento: dataStr, hora_agendamento: '' });
  };

  if (loading) return <Loading />;
  if (!clinica) return <div className="text-center py-12">Clínica não encontrada</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Novo Agendamento</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-2">{clinica.nome_fantasia}</h2>
        <p className="text-gray-600">{clinica.endereco}</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Especialização */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialização *
          </label>
          <select
            required
            value={formData.especializacao_id}
            onChange={(e) => setFormData({ ...formData, especializacao_id: e.target.value })}
            className="input-field"
          >
            <option value="">Selecione uma especialização</option>
            {clinica.especializacoes?.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.nome}
                {esp.ClinicaEspecializacao?.preco && 
                  ` - $ ${parseFloat(esp.ClinicaEspecializacao.preco).toFixed(2)}`
                }
              </option>
            ))}
          </select>
        </div>

        {/* Data - Calendário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Data *
            {carregandoDatas && <span className="ml-2 text-blue-600">⏳ Verificando...</span>}
          </label>
          
          {formData.especializacao_id ? (
            <div className="border rounded-lg p-4 bg-white">
              {/* Cabeçalho do Calendário */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handleMesAnterior}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="font-semibold text-lg">
                  {mesSelecionado.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  type="button"
                  onClick={handleProximoMes}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(dia => (
                  <div key={dia} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Dias do Mês */}
              <div className="grid grid-cols-7 gap-2">
                {gerarDiasDoMes().map((data, idx) => {
                  if (!data) {
                    return <div key={idx}></div>;
                  }

                  const isPassada = isDataPassada(data);
                  const isDisponivel = isDataDisponivel(data);
                  
                  // Comparar com a data selecionada
                  const year = data.getFullYear();
                  const month = String(data.getMonth() + 1).padStart(2, '0');
                  const day = String(data.getDate()).padStart(2, '0');
                  const dataStr = `${year}-${month}-${day}`;
                  const isSelecionada = formData.data_agendamento === dataStr;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !isPassada && handleSelecionarDia(data)}
                      disabled={isPassada || (!carregandoDatas && !isDisponivel)}
                      className={`
                        py-2 px-1 rounded-lg text-sm font-medium transition
                        ${isSelecionada ? 'bg-primary-600 text-white shadow-lg' : ''}
                        ${!isSelecionada && isDisponivel && !isPassada 
                          ? 'bg-green-100 hover:bg-green-200 text-green-900 cursor-pointer' 
                          : ''}
                        ${!isDisponivel && !isPassada && !isSelecionada
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : ''}
                        ${isPassada 
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                          : ''}
                      `}
                    >
                      {data.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Indisponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 rounded"></div>
                  <span>Passado</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              Selecione uma especialização para ver datas disponíveis.
            </div>
          )}
        </div>

        {/* Horário */}
        {formData.especializacao_id && formData.data_agendamento && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário * 
              {horariosDisponiveis.length > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  ({horariosDisponiveis.length} horários disponíveis)
                </span>
              )}
            </label>
            {horariosDisponiveis.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {horariosDisponiveis.map((horario) => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => setFormData({ ...formData, hora_agendamento: horario })}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                      formData.hora_agendamento === horario
                        ? 'bg-primary-600 text-white'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {horario}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                Nenhum horário disponível para esta data e especialização.
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="input-field"
            rows="3"
            placeholder="Informações adicionais sobre a consulta..."
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={submitting || !formData.hora_agendamento}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
