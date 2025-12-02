import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicasAPI, especializacoesAPI } from '../services/api';
import Loading from '../components/Loading';
import { Search, Hospital, MapPin, DollarSign, Trash2 } from 'lucide-react';

export default function Clinicas() {
  const [clinicas, setClinicas] = useState([]);
  const [especializacoes, setEspecializacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginacao, setPaginacao] = useState({ pagina: 1, totalPaginas: 1 });
  const [filtros, setFiltros] = useState({
    busca: '',
    cidade: '',
    especializacao: '',
    preco_max: '',
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
      // Error handled silently
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
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      cidade: '',
      especializacao: '',
      preco_min: '',
      preco_max: '',
      limite: 12
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Clínicas Disponíveis</h1>

      {/* Filtros Refinados */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="text-primary-600" size={20} />
            <span className="hidden sm:inline">Filtros de Busca</span>
            <span className="sm:hidden">Filtros</span>
          </h2>
          <button 
            onClick={limparFiltros} 
            className="text-xs sm:text-sm text-gray-600 hover:text-primary-600 transition flex items-center gap-1"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        {/* Linha 1: Busca, Cidade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar clínica..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="input pl-10 text-sm sm:text-base"
            />
            <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cidade"
              value={filtros.cidade}
              onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
              className="input pl-10 text-sm sm:text-base"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Linha 2: Especialização, Preço */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <select
            value={filtros.especializacao}
            onChange={(e) => setFiltros({ ...filtros, especializacao: e.target.value })}
            className="input text-sm sm:text-base"
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
              className="input pl-8 text-sm sm:text-base"
            />
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Botão de Busca */}
        <button 
          onClick={() => buscarClinicas(1)} 
          className="w-full btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Buscar Clínicas
        </button>
      </div>

      {/* Resultados */}
      <div className="mb-4 text-sm sm:text-base text-gray-600">
        {clinicas.length > 0 && `${clinicas.length} clínica(s) encontrada(s)`}
      </div>

      {/* Lista de Clínicas */}
      {clinicas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base sm:text-lg">Nenhuma clínica encontrada</p>
          <button onClick={limparFiltros} className="btn-secondary mt-4 text-sm sm:text-base">
            Limpar Filtros e Ver Todas
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">{clinicas.map((clinica) => (
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
