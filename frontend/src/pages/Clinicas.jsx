import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicasAPI, especializacoesAPI } from '../services/api';
import Loading from '../components/Loading';
import { Search, Hospital, MapPin, DollarSign, Trash2, ArrowUpDown } from 'lucide-react';

export default function Clinicas() {
  const [clinicas, setClinicas] = useState([]);
  const [especializacoes, setEspecializacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginacao, setPaginacao] = useState({ pagina: 1, totalPaginas: 1 });
  const [filtros, setFiltros] = useState({
    busca: '',
    cidade: '',
    estado: '',
    especializacao: '',
    preco_min: '',
    preco_max: '',
    ordenar: 'nome',
    limite: 12
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [clinicasRes, especRes] = await Promise.all([
        clinicasAPI.listar(),
        especializacoesAPI.listar()
      ]);
      setClinicas(clinicasRes.data.clinicas);
      setEspecializacoes(especRes.data.especializacoes);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarClinicas = async (novaPagina = 1) => {
    setLoading(true);
    try {
      const response = await clinicasAPI.listar({ ...filtros, pagina: novaPagina });
      setClinicas(response.data.clinicas);
      setPaginacao({
        pagina: response.data.pagina,
        totalPaginas: response.data.totalPaginas
      });
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      cidade: '',
      estado: '',
      especializacao: '',
      preco_min: '',
      preco_max: '',
      ordenar: 'nome',
      limite: 12
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Clínicas Disponíveis</h1>

      {/* Filtros Refinados */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="text-primary-600" size={24} />
            Filtros de Busca
          </h2>
          <button 
            onClick={limparFiltros} 
            className="text-sm text-gray-600 hover:text-primary-600 transition flex items-center gap-1"
          >
            <Trash2 size={16} />
            Limpar
          </button>
        </div>

        {/* Linha 1: Busca, Cidade, Estado */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar clínica..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="input pl-10"
            />
            <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cidade"
              value={filtros.cidade}
              onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
              className="input pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="input"
          >
            <option value="">Todos os Estados</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="MG">Minas Gerais</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="PR">Paraná</option>
            <option value="SC">Santa Catarina</option>
            <option value="BA">Bahia</option>
            <option value="PE">Pernambuco</option>
            <option value="CE">Ceará</option>
          </select>
        </div>

        {/* Linha 2: Especialização, Preços, Ordenação */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <select
            value={filtros.especializacao}
            onChange={(e) => setFiltros({ ...filtros, especializacao: e.target.value })}
            className="input"
          >
            <option value="">Todas as Especializações</option>
            {especializacoes.map((esp) => (
              <option key={esp.id} value={esp.id}>
                {esp.icone} {esp.nome}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="number"
              placeholder="Preço máximo"
              value={filtros.preco_max}
              onChange={(e) => setFiltros({ ...filtros, preco_max: e.target.value })}
              className="input pl-8"
            />
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <select
            value={filtros.ordenar}
            onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
            className="input"
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="preco">Ordenar por Preço</option>
          </select>
        </div>

        {/* Botão de Busca */}
        <button 
          onClick={() => buscarClinicas(1)} 
          className="w-full md:w-auto btn-primary px-8 py-3 text-base font-semibold flex items-center justify-center gap-2"
        >
          <Search size={20} />
          Buscar Clínicas
        </button>
      </div>

      {/* Resultados */}
      <div className="mb-4 text-gray-600">
        {clinicas.length > 0 && `${clinicas.length} clínica(s) encontrada(s)`}
      </div>

      {/* Lista de Clínicas */}
      {clinicas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhuma clínica encontrada</p>
          <button onClick={limparFiltros} className="btn-secondary mt-4">
            Limpar Filtros e Ver Todas
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {clinicas.map((clinica) => (
              <Link
                key={clinica.id}
              to={`/clinicas/${clinica.id}`}
              className="card hover:shadow-xl transition-shadow"
            >
              {clinica.foto_capa && (
                <img
                  src={`http://localhost:3333${clinica.foto_capa}`}
                  alt={clinica.nome_fantasia}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{clinica.nome_fantasia}</h3>
                
                <p className="text-gray-600 mb-2 flex items-center gap-1">
                  <MapPin size={16} />
                  {clinica.cidade}{clinica.estado && `, ${clinica.estado}`}
                </p>
                {clinica.descricao && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {clinica.descricao}
                  </p>
                )}
                {clinica.especializacoes && clinica.especializacoes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {clinica.especializacoes.slice(0, 3).map((esp) => (
                      <span
                        key={esp.id}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {esp.nome}
                        {esp.ClinicaEspecializacao?.preco && (
                          <span className="ml-1 font-bold flex items-center gap-0.5">
                            <DollarSign size={12} />
                            {parseFloat(esp.ClinicaEspecializacao.preco).toFixed(0)}
                          </span>
                        )}
                      </span>
                    ))}
                    {clinica.especializacoes.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{clinica.especializacoes.length - 3} mais
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Paginação */}
        {paginacao.totalPaginas > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => buscarClinicas(paginacao.pagina - 1)}
              disabled={paginacao.pagina === 1}
              className="btn-secondary disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="px-4 py-2">
              Página {paginacao.pagina} de {paginacao.totalPaginas}
            </span>
            <button
              onClick={() => buscarClinicas(paginacao.pagina + 1)}
              disabled={paginacao.pagina === paginacao.totalPaginas}
              className="btn-secondary disabled:opacity-50"
            >
              Próximo →
            </button>
          </div>
        )}
      </>
      )}
    </div>
  );
}
