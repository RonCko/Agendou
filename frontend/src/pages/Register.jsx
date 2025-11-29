import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

export default function Register() {
  const [tipo, setTipo] = useState('paciente');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    // Paciente
    cpf: '',
    data_nascimento: '',
    endereco: '',
    // Clínica
    cnpj: '',
    nome_fantasia: '',
    descricao: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone_comercial: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSend = {
      ...formData,
      tipo,
      endereco: tipo === 'clinica' ? `${formData.endereco}, ${formData.cidade} - ${formData.estado}` : formData.endereco
    };

    const result = await register(dataToSend);
    
    if (result.success) {
      navigate('/clinicas');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
            <p className="mt-2 text-gray-600">Cadastre-se no Agendou</p>
          </div>

          {/* Seletor de Tipo */}
          <div className="flex space-x-4 mb-8">
            <button
              type="button"
              onClick={() => setTipo('paciente')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                tipo === 'paciente'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sou Paciente
            </button>
            <button
              type="button"
              onClick={() => setTipo('clinica')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                tipo === 'clinica'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sou Clínica
            </button>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Comuns */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tipo === 'clinica' ? 'Nome do Responsável' : 'Nome Completo'} *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  name="senha"
                  required
                  minLength={6}
                  value={formData.senha}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Campos específicos para Paciente */}
            {tipo === 'paciente' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      required
                      value={formData.cpf}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      name="data_nascimento"
                      required
                      value={formData.data_nascimento}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </>
            )}

            {/* Campos específicos para Clínica */}
            {tipo === 'clinica' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      name="cnpj"
                      required
                      value={formData.cnpj}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Fantasia *
                    </label>
                    <input
                      type="text"
                      name="nome_fantasia"
                      required
                      value={formData.nome_fantasia}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    required
                    value={formData.endereco}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Rua, número"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      name="cidade"
                      required
                      value={formData.cidade}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="estado"
                      required
                      maxLength={2}
                      value={formData.estado}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone Comercial
                  </label>
                  <input
                    type="tel"
                    name="telefone_comercial"
                    value={formData.telefone_comercial}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
