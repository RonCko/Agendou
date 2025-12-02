import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import { formatarTelefone, formatarCPF, formatarCNPJ } from '../utils/formatters';

export default function ConfiguracoesPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
                  <p className="text-gray-900 mt-1 text-lg">{formatarCNPJ(user.clinica.cnpj)}</p>
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
