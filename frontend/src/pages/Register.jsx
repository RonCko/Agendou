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
    const name = e.target.name;
    let value = e.target.value;

    //Formatação de dados inseridos
    if (name === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11);
      value = value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    if (name === "cnpj") {
      value = value.replace(/\D/g, "").slice(0, 14);
      value = value
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
    if (name === "telefone" || name === "telefone_comercial") {
      value = value.replace(/\D/g, "").slice(0, 11);
      value = value.length > 10
        ? value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        : value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    if (name === "cep") {
      value = value.replace(/\D/g, "").slice(0, 8);
      value = value.replace(/(\d{5})(\d{3})/, "$1-$2");
    }

    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação de idade mínima (somente pacientes)
    if (tipo === 'paciente') {
      const hoje = new Date();
      const nascimento = new Date(formData.data_nascimento);

      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      const dia = hoje.getDate() - nascimento.getDate();

      // Ajuste da idade caso ainda não tenha feito aniversário este ano
      if (mes < 0 || (mes === 0 && dia < 0)) {
        idade--;
      }

      if (idade < 18) {
        setError('Você precisa ter pelo menos 18 anos para se cadastrar.');
        setLoading(false);
        return;
      }
    }
    const limpar = (valor) => valor.replace(/\D/g, '');

    const dataToSend = {
      ...formData,
      tipo,
      cpf: limpar(formData.cpf),
      cnpj: limpar(formData.cnpj),
      telefone: limpar(formData.telefone),
      telefone_comercial: limpar(formData.telefone_comercial),
      cep: limpar(formData.cep),
      endereco:
        tipo === 'clinica'
          ? `${formData.endereco}, ${formData.cidade} - ${formData.estado}`
          : formData.endereco,
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
              className={`flex-1 py-3 rounded-lg font-medium transition ${tipo === 'paciente'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Sou Paciente
            </button>
            <button
              type="button"
              onClick={() => setTipo('clinica')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${tipo === 'clinica'
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
