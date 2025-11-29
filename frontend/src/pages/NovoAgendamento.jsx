import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clinicasAPI, agendamentosAPI } from '../services/api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { DollarSign } from 'lucide-react';

export default function NovoAgendamento() {
  const { clinicaId } = useParams();
  const navigate = useNavigate();
  const [clinica, setClinica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  
  const [formData, setFormData] = useState({
    especializacao_id: '',
    data_agendamento: '',
    hora_agendamento: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarClinica();
  }, [clinicaId]);

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

  const verificarDisponibilidade = async () => {
    try {
      const response = await agendamentosAPI.verificarDisponibilidade({
        clinica_id: clinicaId,
        especializacao_id: formData.especializacao_id,
        data_agendamento: formData.data_agendamento
      });
      setHorariosOcupados(response.data.horariosOcupados || []);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
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

  const gerarHorarios = () => {
    const horarios = [];
    for (let h = 8; h <= 18; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 18) horarios.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return horarios;
  };

  const isHorarioDisponivel = (horario) => {
    return !horariosOcupados.includes(horario);
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

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data *
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.data_agendamento}
            onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Horário */}
        {formData.especializacao_id && formData.data_agendamento && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário * 
              {horariosOcupados.length > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  ({horariosOcupados.length} horários ocupados)
                </span>
              )}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {gerarHorarios().map((horario) => {
                const disponivel = isHorarioDisponivel(horario);
                return (
                  <button
                    key={horario}
                    type="button"
                    disabled={!disponivel}
                    onClick={() => setFormData({ ...formData, hora_agendamento: horario })}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                      formData.hora_agendamento === horario
                        ? 'bg-primary-600 text-white'
                        : disponivel
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-red-100 text-red-400 cursor-not-allowed line-through'
                    }`}
                  >
                    {horario}
                  </button>
                );
              })}
            </div>
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
