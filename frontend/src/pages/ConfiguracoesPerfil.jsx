import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

export default function ConfiguracoesPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)})${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    return telefone;
  };

  // Função para formatar CPF
  const formatarCPF = (cpf) => {
    if (!cpf) return 'Não informado';
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }
    return cpf;
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Meu Perfil
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Visualize suas informações pessoais
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 font-medium">Nome</label>
              <p className="text-gray-900 mt-1 text-lg">{user.nome}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <p className="text-gray-900 mt-1 text-lg">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Telefone</label>
              <p className="text-gray-900 mt-1 text-lg">{formatarTelefone(user.telefone)}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Endereço</label>
              <p className="text-gray-900 mt-1 text-lg">
                {(user.paciente?.endereco || user.clinica?.endereco) || 'Não informado'}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Tipo de Conta</label>
              <p className="text-gray-900 mt-1 text-lg capitalize">{user.tipo}</p>
            </div>

            {user.tipo === 'paciente' && user.paciente && (
              <div>
                <label className="text-sm text-gray-600 font-medium">CPF</label>
                <p className="text-gray-900 mt-1 text-lg">{formatarCPF(user.paciente.cpf)}</p>
              </div>
            )}

            {user.tipo === 'clinica' && user.clinica && (
              <>
                <div>
                  <label className="text-sm text-gray-600 font-medium">CNPJ</label>
                  <p className="text-gray-900 mt-1 text-lg">{user.clinica.cnpj || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Nome Fantasia</label>
                  <p className="text-gray-900 mt-1 text-lg">{user.clinica.nome_fantasia || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Cidade</label>
                  <p className="text-gray-900 mt-1 text-lg">{user.clinica.cidade || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Estado</label>
                  <p className="text-gray-900 mt-1 text-lg">{user.clinica.estado || 'Não informado'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}
