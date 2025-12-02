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
  const [activeTab, setActiveTab] = useState('dados'); // dados, especializacoes, horarios, bloqueios, fotos
  const [modoHorarios, setModoHorarios] = useState('configuracao'); // configuracao, bloqueios

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

  // NOVA ARQUITETURA: Configuração recorrente
  const [configuracaoHorarios, setConfiguracaoHorarios] = useState({
    especializacao_id: '',
    dias_semana: [1, 2, 3, 4, 5],
    hora_inicio: '08:00',
    hora_fim: '18:00',
    duracao_slot: 30,
    intervalo_almoco: false,
    hora_inicio_almoco: '12:00',
    hora_fim_almoco: '13:00',
    data_inicio: '',
    data_fim: ''
  });

  const [configuracoesExistentes, setConfiguracoesExistentes] = useState([]);

  // Exceções/Bloqueios
  const [novobloqueio, setNovobloqueio] = useState({
    especializacao_id: '',
    data_excecao: '',
    hora_inicio: '',
    hora_fim: '',
    tipo: 'bloqueio',
    motivo: '',
    dia_inteiro: true
  });

  const [excecoesExistentes, setExcecoesExistentes] = useState([]);

  // LEGACY: manter para compatibilidade
  const [geradorHorarios, setGeradorHorarios] = useState({
    especializacao_id: '',
    data_inicio: '',
    data_fim: '',
    dias_semana: [1, 2, 3, 4, 5],
    hora_inicio: '08:00',
    hora_fim: '18:00',
    duracao_slot: 30,
    intervalo_almoco: false,
    hora_inicio_almoco: '12:00',
    hora_fim_almoco: '13:00'
  });

  const [horariosExistentes, setHorariosExistentes] = useState([]);
  const [filtroHorarios, setFiltroHorarios] = useState({
    especializacao_id: '',
    data_inicio: '',
    data_fim: ''
  });

  const diasSemana = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

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

        // Carregar configurações e horários
        await carregarConfiguracoes(clinicaData.id);
        await carregarExcecoes(clinicaData.id);
        await carregarHorarios(clinicaData.id);
      }

      setEspecializacoes(especRes.data.especializacoes || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  }

  async function carregarConfiguracoes(clinicaId) {
    try {
      const response = await clinicasAPI.listarConfiguracoesHorarios(clinicaId);
      setConfiguracoesExistentes(response.data.configuracoes || []);
    } catch (error) {
      setConfiguracoesExistentes([]);
    }
  }

  async function carregarExcecoes(clinicaId) {
    try {
      const response = await clinicasAPI.listarExcecoes(clinicaId);
      setExcecoesExistentes(response.data.excecoes || []);
    } catch (error) {
      setExcecoesExistentes([]);
    }
  }

  async function carregarHorarios(clinicaId) {
    try {
      // Construir objeto de filtros apenas com valores não vazios
      const filtros = {};
      if (filtroHorarios.especializacao_id) {
        filtros.especializacao_id = filtroHorarios.especializacao_id;
      }
      if (filtroHorarios.data_inicio) {
        filtros.data_inicio = filtroHorarios.data_inicio;
      }
      if (filtroHorarios.data_fim) {
        filtros.data_fim = filtroHorarios.data_fim;
      }
      
      const response = await clinicasAPI.listarHorarios(clinicaId, filtros);
      setHorariosExistentes(response.data.horarios || []);
    } catch (error) {
      setHorariosExistentes([]);
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

  // ===== NOVA ARQUITETURA: CONFIGURAÇÃO RECORRENTE =====
  
  async function handleSalvarConfiguracao(e) {
    e.preventDefault();
    
    if (!configuracaoHorarios.especializacao_id) {
      setAlert({ type: 'error', message: 'Selecione uma especialização' });
      return;
    }

    if (configuracaoHorarios.dias_semana.length === 0) {
      setAlert({ type: 'error', message: 'Selecione pelo menos um dia da semana' });
      return;
    }

    try {
      setLoading(true);
      await clinicasAPI.configurarHorariosRecorrentes(clinica.id, configuracaoHorarios);
      setAlert({ type: 'success', message: 'Configuração salva com sucesso! 🎉' });
      await carregarConfiguracoes(clinica.id);
      
      // Resetar formulário
      setConfiguracaoHorarios({
        especializacao_id: '',
        dias_semana: [1, 2, 3, 4, 5],
        hora_inicio: '08:00',
        hora_fim: '18:00',
        duracao_slot: 30,
        intervalo_almoco: false,
        hora_inicio_almoco: '12:00',
        hora_fim_almoco: '13:00',
        data_inicio: '',
        data_fim: ''
      });
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao salvar configuração' });
    } finally {
      setLoading(false);
    }
  }

  async function handleBloquearHorario(e) {
    e.preventDefault();
    
    if (!novobloqueio.especializacao_id || !novobloqueio.data_excecao) {
      setAlert({ type: 'error', message: 'Preencha especialização e data' });
      return;
    }

    try {
      const dados = {
        especializacao_id: novobloqueio.especializacao_id,
        data_excecao: novobloqueio.data_excecao,
        tipo: novobloqueio.tipo,
        motivo: novobloqueio.motivo || null
      };

      // Se não for dia inteiro, incluir horários
      if (!novobloqueio.dia_inteiro) {
        dados.hora_inicio = novobloqueio.hora_inicio;
        dados.hora_fim = novobloqueio.hora_fim;
      }

      await clinicasAPI.bloquearHorarios(clinica.id, dados);
      setAlert({ type: 'success', message: 'Horário bloqueado com sucesso!' });
      await carregarExcecoes(clinica.id);
      
      // Resetar formulário
      setNovobloqueio({
        especializacao_id: '',
        data_excecao: '',
        hora_inicio: '',
        hora_fim: '',
        tipo: 'bloqueio',
        motivo: '',
        dia_inteiro: true
      });
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao bloquear horário' });
    }
  }

  async function handleRemoverExcecao(excecaoId) {
    if (!confirm('Deseja remover este bloqueio?')) return;
    
    try {
      await clinicasAPI.removerExcecao(clinica.id, excecaoId);
      setAlert({ type: 'success', message: 'Bloqueio removido!' });
      await carregarExcecoes(clinica.id);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao remover bloqueio' });
    }
  }

  // ===== LEGACY: MANTER PARA COMPATIBILIDADE =====

  async function handleSalvarHorarios(e) {
    e.preventDefault();
    
    if (!geradorHorarios.especializacao_id) {
      setAlert({ type: 'error', message: 'Selecione uma especialização' });
      return;
    }

    if (!geradorHorarios.data_inicio || !geradorHorarios.data_fim) {
      setAlert({ type: 'error', message: 'Defina o período (data início e fim)' });
      return;
    }

    if (geradorHorarios.dias_semana.length === 0) {
      setAlert({ type: 'error', message: 'Selecione pelo menos um dia da semana' });
      return;
    }

    try {
      setLoading(true);
      await clinicasAPI.gerarHorarios(clinica.id, geradorHorarios);
      setAlert({ type: 'success', message: 'Horários gerados com sucesso!' });
      await carregarHorarios(clinica.id);
      
      // Resetar formulário
      setGeradorHorarios({
        ...geradorHorarios,
        data_inicio: '',
        data_fim: ''
      });
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao gerar horários' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoverHorarios(especializacaoId, dataInicio, dataFim) {
    if (!confirm(`Deseja remover todos os horários desta especialização no período selecionado?`)) return;
    
    try {
      await clinicasAPI.removerHorarios(clinica.id, {
        especializacao_id: especializacaoId,
        data_inicio: dataInicio,
        data_fim: dataFim
      });
      setAlert({ type: 'success', message: 'Horários removidos com sucesso!' });
      await carregarHorarios(clinica.id);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao remover horários' });
    }
  }

  function toggleDiaSemana(dia) {
    const novosDias = geradorHorarios.dias_semana.includes(dia)
      ? geradorHorarios.dias_semana.filter(d => d !== dia)
      : [...geradorHorarios.dias_semana, dia].sort();
    
    setGeradorHorarios({ ...geradorHorarios, dias_semana: novosDias });
  }

  function toggleDiaSemanaConfig(dia) {
    const novosDias = configuracaoHorarios.dias_semana.includes(dia)
      ? configuracaoHorarios.dias_semana.filter(d => d !== dia)
      : [...configuracaoHorarios.dias_semana, dia].sort();
    
    setConfiguracaoHorarios({ ...configuracaoHorarios, dias_semana: novosDias });
  }

  function obterDataMinima() {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  function agruparHorariosPorEspecializacao() {
    const agrupado = {};
    
    if (!horariosExistentes || horariosExistentes.length === 0) {
      return [];
    }
    
    horariosExistentes.forEach(horario => {
      if (!horario || !horario.especializacao_id) return;
      
      const key = horario.especializacao_id;
      if (!agrupado[key]) {
        // Tentar ambas as capitalizações (Sequelize pode retornar de formas diferentes)
        const especializacao = horario.especializacao || horario.Especializacao;
        agrupado[key] = {
          especializacao: especializacao || { id: key, nome: 'Sem nome' },
          horarios: []
        };
      }
      agrupado[key].horarios.push(horario);
    });

    return Object.values(agrupado);
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

  async function handleRemoverFotoCapa() {
    if (!confirm('Deseja realmente remover a foto de capa?')) return;

    try {
      await uploadAPI.removerFotoCapa(clinica.id);
      setAlert({ type: 'success', message: 'Foto de capa removida!' });
      carregarDados();
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.erro || 'Erro ao remover foto' });
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

      {/* Horários - NOVA ARQUITETURA OTIMIZADA */}
      {activeTab === 'horarios' && (
        <div className="space-y-6">
          {/* Seletor de Modo */}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setModoHorarios('configuracao')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                modoHorarios === 'configuracao'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Configuração Recorrente
            </button>
            <button
              onClick={() => setModoHorarios('bloqueios')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                modoHorarios === 'bloqueios'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bloqueios e Exceções
            </button>
          </div>

          {/* MODO: CONFIGURAÇÃO RECORRENTE */}
          {modoHorarios === 'configuracao' && (
            <>
              <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl shadow-lg border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-primary-600" size={28} />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Configurar Horários Recorrentes</h2>
                  </div>
                </div>
                
                <form onSubmit={handleSalvarConfiguracao} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Especialização *</label>
                    <select
                      value={configuracaoHorarios.especializacao_id}
                      onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, especializacao_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      required
                    >
                      <option value="">Selecione...</option>
                      {clinica.especializacoes?.map(esp => (
                        <option key={esp.id} value={esp.id}>{esp.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Dias da Semana * <span className="text-gray-500 font-normal">(dias de atendimento)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {diasSemana.map(dia => (
                        <button
                          key={dia.value}
                          type="button"
                          onClick={() => toggleDiaSemanaConfig(dia.value)}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            configuracaoHorarios.dias_semana.includes(dia.value)
                              ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {dia.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Início *</label>
                      <input
                        type="time"
                        value={configuracaoHorarios.hora_inicio}
                        onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, hora_inicio: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Horário Fim *</label>
                      <input
                        type="time"
                        value={configuracaoHorarios.hora_fim}
                        onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, hora_fim: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Duração *</label>
                      <select
                        value={configuracaoHorarios.duracao_slot}
                        onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, duracao_slot: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min</option>
                        <option value="90">90 min</option>
                        <option value="120">120 min</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={configuracaoHorarios.intervalo_almoco}
                        onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, intervalo_almoco: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-200"
                      />
                      <span className="font-semibold text-gray-700">Intervalo de almoço</span>
                    </label>
                    
                    {configuracaoHorarios.intervalo_almoco && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Início</label>
                          <input
                            type="time"
                            value={configuracaoHorarios.hora_inicio_almoco}
                            onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, hora_inicio_almoco: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Fim</label>
                          <input
                            type="time"
                            value={configuracaoHorarios.hora_fim_almoco}
                            onChange={e => setConfiguracaoHorarios({ ...configuracaoHorarios, hora_fim_almoco: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={!clinica.especializacoes || clinica.especializacoes.length === 0}
                      className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      💾 Salvar Configuração
                    </button>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-2">Como funciona:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Configure somente uma vez e os horários são gerados automaticamente</li>
                      <li>Para feriados/bloqueios, use a aba "Bloqueios e Exceções"</li>
                    </ul>
                  </div>
                </form>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Configurações Ativas</h2>
                
                {configuracoesExistentes.length > 0 ? (
                  <div className="space-y-4">
                    {configuracoesExistentes.map(config => (
                      <div key={config.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                              {config.especializacao?.nome || 'Especialização'}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Dias:</span>
                                <p className="font-medium">
                                  {config.dias_semana.map(d => diasSemana.find(dia => dia.value === d)?.label).join(', ')}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Horário:</span>
                                <p className="font-medium">{config.hora_inicio} - {config.hora_fim}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Duração:</span>
                                <p className="font-medium">{config.duracao_slot} min</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Almoço:</span>
                                <p className="font-medium">
                                  {config.intervalo_almoco 
                                    ? `${config.hora_inicio_almoco} - ${config.hora_fim_almoco}` 
                                    : 'Não'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setConfiguracaoHorarios({
                                ...config,
                                data_inicio: config.data_inicio || '',
                                data_fim: config.data_fim || ''
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
                          >
                            ✏️ Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nenhuma configuração cadastrada</p>
                    <p className="text-sm mt-2">Configure os horários recorrentes acima</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO: BLOQUEIOS */}
          {modoHorarios === 'bloqueios' && (
            <>
              <div className="bg-gradient-to-br from-white to-red-50 p-8 rounded-xl shadow-lg border-2 border-red-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🚫</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Bloquear Horários</h2>
                    <p className="text-sm text-gray-600 mt-1">Para feriados, eventos ou bloqueios pontuais</p>
                  </div>
                </div>
                
                <form onSubmit={handleBloquearHorario} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Especialização *</label>
                      <select
                        value={novobloqueio.especializacao_id}
                        onChange={e => setNovobloqueio({ ...novobloqueio, especializacao_id: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {clinica.especializacoes?.map(esp => (
                          <option key={esp.id} value={esp.id}>{esp.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Data *</label>
                      <input
                        type="date"
                        value={novobloqueio.data_excecao}
                        onChange={e => setNovobloqueio({ ...novobloqueio, data_excecao: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={novobloqueio.dia_inteiro}
                        onChange={e => setNovobloqueio({ ...novobloqueio, dia_inteiro: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-200"
                      />
                      <span className="font-semibold text-gray-700">Bloquear dia inteiro</span>
                    </label>
                    
                    {!novobloqueio.dia_inteiro && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Horário Início</label>
                          <input
                            type="time"
                            value={novobloqueio.hora_inicio}
                            onChange={e => setNovobloqueio({ ...novobloqueio, hora_inicio: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Horário Fim</label>
                          <input
                            type="time"
                            value={novobloqueio.hora_fim}
                            onChange={e => setNovobloqueio({ ...novobloqueio, hora_fim: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                      <select
                        value={novobloqueio.tipo}
                        onChange={e => setNovobloqueio({ ...novobloqueio, tipo: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                      >
                        <option value="bloqueio">Bloqueio</option>
                        <option value="feriado">Feriado</option>
                        <option value="evento">Evento</option>
                        <option value="customizado">Customizado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo (opcional)</label>
                      <input
                        type="text"
                        value={novobloqueio.motivo}
                        onChange={e => setNovobloqueio({ ...novobloqueio, motivo: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                        placeholder="Ex: Natal, Reunião..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Bloquear Horário
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Bloqueios Cadastrados</h2>
                
                {excecoesExistentes.length > 0 ? (
                  <div className="space-y-3">
                    {excecoesExistentes.map(excecao => (
                      <div key={excecao.id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold uppercase">
                              {excecao.tipo}
                            </span>
                            <h3 className="font-bold text-gray-800">
                              {excecao.especializacao?.nome || 'Especialização'}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">
                              {new Date(excecao.data_excecao + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </span>
                            {excecao.hora_inicio && excecao.hora_fim && (
                              <span className="ml-2">• {excecao.hora_inicio} - {excecao.hora_fim}</span>
                            )}
                            {!excecao.hora_inicio && !excecao.hora_fim && (
                              <span className="ml-2 text-red-600 font-medium">• Dia inteiro</span>
                            )}
                            {excecao.motivo && (
                              <span className="ml-2">• {excecao.motivo}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoverExcecao(excecao.id)}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                        Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <span className="text-5xl mb-4 block">🚫</span>
                    <p className="text-lg">Nenhum bloqueio cadastrado</p>
                    <p className="text-sm mt-2">Use o formulário acima para bloquear horários</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Fotos */}
      {activeTab === 'fotos' && (
        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Foto de Capa</h2>
          {clinica.foto_capa && (
            <div className="mb-6 relative">
              <img 
                src={`http://localhost:3333${clinica.foto_capa}`} 
                alt="Foto de capa" 
                className="w-full h-72 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={handleRemoverFotoCapa}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Remover Foto
              </button>
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
          <p className="text-sm text-gray-500 mt-4">📸 Tamanho máximo: 5MB • Formatos: JPG, PNG, GIF, WEBP</p>
        </div>
      )}
    </div>
  );
}
