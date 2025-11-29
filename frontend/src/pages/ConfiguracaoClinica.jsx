import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clinicasAPI, especializacoesAPI, uploadAPI } from '../services/api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { FileText, Stethoscope, Clock, Camera, DollarSign } from 'lucide-react';


export default function ConfiguracaoClinica() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [clinica, setClinica] = useState(null);
  const [especializacoes, setEspecializacoes] = useState([]);
  const [activeTab, setActiveTab] = useState('dados'); // dados, especializacoes, horarios, fotos

  // Dados da clínica
  const [dadosClinica, setDadosClinica] = useState({
    nome_fantasia: '',
    descricao: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone_comercial: ''
  });

  // Especialização para adicionar
  const [novaEspecializacao, setNovaEspecializacao] = useState({
    especializacao_id: '',
    preco: '',
    duracao_minutos: 30
  });

  // Horários de atendimento
  const [horarios, setHorarios] = useState([
    { dia_semana: 1, hora_inicio: '08:00', hora_fim: '18:00', ativo: true },
    { dia_semana: 2, hora_inicio: '08:00', hora_fim: '18:00', ativo: true },
    { dia_semana: 3, hora_inicio: '08:00', hora_fim: '18:00', ativo: true },
    { dia_semana: 4, hora_inicio: '08:00', hora_fim: '18:00', ativo: true },
    { dia_semana: 5, hora_inicio: '08:00', hora_fim: '18:00', ativo: true },
    { dia_semana: 6, hora_inicio: '08:00', hora_fim: '12:00', ativo: false }
  ]);

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [clinicaRes, especRes] = await Promise.all([
        clinicasAPI.listar({ usuario_id: user.id }),
        especializacoesAPI.listar()
      ]);

      if (clinicaRes.data.clinicas && clinicaRes.data.clinicas.length > 0) {
        const clinicaData = clinicaRes.data.clinicas[0];
        setClinica(clinicaData);
        setDadosClinica({
          nome_fantasia: clinicaData.nome_fantasia || '',
          descricao: clinicaData.descricao || '',
          endereco: clinicaData.endereco || '',
          cidade: clinicaData.cidade || '',
          estado: clinicaData.estado || '',
          cep: clinicaData.cep || '',
          telefone_comercial: clinicaData.telefone_comercial || ''
        });

        if (clinicaData.horarios && clinicaData.horarios.length > 0) {
          setHorarios(clinicaData.horarios.map(h => ({
            dia_semana: h.dia_semana,
            hora_inicio: h.hora_inicio,
            hora_fim: h.hora_fim,
            ativo: h.ativo
          })));
        }
      }

      setEspecializacoes(especRes.data.especializacoes || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarDados(e) {
    e.preventDefault();
    try {
      await clinicasAPI.atualizar(clinica.id, dadosClinica);
      setAlert({ type: 'success', message: 'Dados atualizados com sucesso!' });
      carregarDados();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao atualizar' });
    }
  }

  async function handleAdicionarEspecializacao(e) {
    e.preventDefault();
    try {
      await clinicasAPI.adicionarEspecializacao(clinica.id, novaEspecializacao);
      setAlert({ type: 'success', message: 'Especialização adicionada!' });
      setNovaEspecializacao({ especializacao_id: '', preco: '', duracao_minutos: 30 });
      carregarDados();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao adicionar' });
    }
  }

  async function handleRemoverEspecializacao(especId) {
    if (!confirm('Deseja remover esta especialização?')) return;
    try {
      await clinicasAPI.removerEspecializacao(clinica.id, especId);
      setAlert({ type: 'success', message: 'Especialização removida!' });
      carregarDados();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao remover' });
    }
  }

  async function handleSalvarHorarios(e) {
    e.preventDefault();
    try {
      await clinicasAPI.configurarHorarios(clinica.id, { horarios });
      setAlert({ type: 'success', message: 'Horários configurados com sucesso!' });
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao salvar horários' });
    }
  }

  async function handleUploadFotoCapa(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    try {
      await uploadAPI.fotoCapa(clinica.id, formData);
      setAlert({ type: 'success', message: 'Foto de capa atualizada!' });
      carregarDados();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao fazer upload' });
    }
  }

  if (loading) return <Loading />;
  if (!clinica) return <div className="container mx-auto p-4">Clínica não encontrada</div>;

  return (
    <div className="container mx-auto p-4">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <h1 className="text-3xl font-bold mb-6">Configurações da Clínica</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dados', label: 'Dados Básicos', icon: FileText },
            { id: 'especializacoes', label: 'Especializações', icon: Stethoscope },
            { id: 'horarios', label: 'Horários', icon: Clock },
            { id: 'fotos', label: 'Fotos', icon: Camera }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dados Básicos */}
      {activeTab === 'dados' && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSalvarDados} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia *</label>
                <input
                  type="text"
                  value={dadosClinica.nome_fantasia}
                  onChange={e => setDadosClinica({ ...dadosClinica, nome_fantasia: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  placeholder="Digite o nome da clínica"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone Comercial</label>
                <input
                  type="text"
                  value={dadosClinica.telefone_comercial}
                  onChange={e => setDadosClinica({ ...dadosClinica, telefone_comercial: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
              <textarea
                value={dadosClinica.descricao}
                onChange={e => setDadosClinica({ ...dadosClinica, descricao: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none resize-none"
                rows="4"
                placeholder="Descreva sua clínica, serviços e diferenciais..."
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                value={dadosClinica.endereco}
                onChange={e => setDadosClinica({ ...dadosClinica, endereco: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  value={dadosClinica.cidade}
                  onChange={e => setDadosClinica({ ...dadosClinica, cidade: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  placeholder="Cidade"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <input
                  type="text"
                  value={dadosClinica.estado}
                  onChange={e => setDadosClinica({ ...dadosClinica, estado: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none uppercase"
                  placeholder="UF"
                  maxLength="2"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
                <input
                  type="text"
                  value={dadosClinica.cep}
                  onChange={e => setDadosClinica({ ...dadosClinica, cep: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                Salvar Dados
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Especializações */}
      {activeTab === 'especializacoes' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Especialização</h2>
            <form onSubmit={handleAdicionarEspecializacao} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especialização *</label>
                  <select
                    value={novaEspecializacao.especializacao_id}
                    onChange={e => setNovaEspecializacao({ ...novaEspecializacao, especializacao_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    required
                  >
                    <option value="">Selecione...</option>
                    {especializacoes.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <DollarSign size={16} />
                    Preço *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaEspecializacao.preco}
                    onChange={e => setNovaEspecializacao({ ...novaEspecializacao, preco: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duração (min) *</label>
                  <input
                    type="number"
                    value={novaEspecializacao.duracao_minutos}
                    onChange={e => setNovaEspecializacao({ ...novaEspecializacao, duracao_minutos: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                  Adicionar
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Especializações Cadastradas</h2>
            {clinica.especializacoes && clinica.especializacoes.length > 0 ? (
              <div className="space-y-3">
                {clinica.especializacoes.map(esp => (
                  <div key={esp.id} className="flex justify-between items-center bg-gray-50 border-2 border-gray-100 hover:border-primary-200 p-4 rounded-lg transition-all">
                    <div>
                      <p className="font-semibold text-gray-800">{esp.nome}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <DollarSign size={14} />
                        {esp.ClinicaEspecializacao?.preco} • {esp.ClinicaEspecializacao?.duracao_minutos} min
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoverEspecializacao(esp.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhuma especialização cadastrada</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Horários */}
      {activeTab === 'horarios' && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Horários de Atendimento</h2>
          <form onSubmit={handleSalvarHorarios} className="space-y-4">
            {horarios.map((horario, index) => (
              <div key={horario.dia_semana} className={`flex items-center gap-4 border-2 p-4 rounded-lg transition-all ${
                horario.ativo ? 'bg-white border-gray-200 hover:border-primary-200' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="w-36">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={horario.ativo}
                      onChange={e => {
                        const novosHorarios = [...horarios];
                        novosHorarios[index].ativo = e.target.checked;
                        setHorarios(novosHorarios);
                      }}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-200 mr-3"
                    />
                    <span className="font-semibold text-gray-700">{diasSemana[horario.dia_semana]}</span>
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="time"
                    value={horario.hora_inicio}
                    onChange={e => {
                      const novosHorarios = [...horarios];
                      novosHorarios[index].hora_inicio = e.target.value;
                      setHorarios(novosHorarios);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!horario.ativo}
                  />
                </div>
                <span className="text-gray-500 font-medium">até</span>
                <div className="flex-1">
                  <input
                    type="time"
                    value={horario.hora_fim}
                    onChange={e => {
                      const novosHorarios = [...horarios];
                      novosHorarios[index].hora_fim = e.target.value;
                      setHorarios(novosHorarios);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!horario.ativo}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <button type="submit" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                Salvar Horários
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fotos */}
      {activeTab === 'fotos' && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Foto de Capa</h2>
          {clinica.foto_capa && (
            <div className="mb-6">
              <img 
                src={`http://localhost:3333${clinica.foto_capa}`} 
                alt="Foto de capa" 
                className="w-full h-72 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadFotoCapa}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">📌 Tamanho máximo: 5MB • Formatos: JPG, PNG, GIF, WEBP</p>
        </div>
      )}
    </div>
  );
}
