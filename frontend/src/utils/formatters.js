/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um número de telefone
 * @param {string} telefone - Número de telefone (apenas dígitos ou com formatação)
 * @returns {string} Telefone formatado ou mensagem padrão
 */
export const formatarTelefone = (telefone) => {
  if (!telefone) return 'Não informado';
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    // Formato: (XX)XXXXX-XXXX
    return `(${numeros.slice(0, 2)})${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }
  
  if (numeros.length === 10) {
    // Formato: (XX)XXXX-XXXX
    return `(${numeros.slice(0, 2)})${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  
  return telefone;
};

/**
 * Formata um CPF 
 * @param {string} cpf - CPF (apenas dígitos ou com formatação)
 * @returns {string} CPF formatado ou mensagem padrão
 */
export const formatarCPF = (cpf) => {
  if (!cpf) return 'Não informado';
  const numeros = cpf.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    // Formato: XXX.XXX.XXX-XX
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }
  
  return cpf;
};

/**
 * Formata um CNPJ
 * @param {string} cnpj - CNPJ (apenas dígitos ou com formatação)
 * @returns {string} CNPJ formatado ou mensagem padrão
 */
export const formatarCNPJ = (cnpj) => {
  if (!cnpj) return 'Não informado';
  const numeros = cnpj.replace(/\D/g, '');
  
  if (numeros.length === 14) {
    // Formato: XX.XXX.XXX/XXXX-XX
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
  }
  
  return cnpj;
};

/**
 * Formata uma data para o formato DD/MM/YYYY
 * @param {string|Date} data - Data no formato ISO ou objeto Date
 * @returns {string} Data formatada (DD/MM/YYYY) ou mensagem padrão
 */
export const formatarData = (data) => {
  if (!data) return 'Não informado';
  
  try {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    
    if (isNaN(dataObj.getTime())) return 'Data inválida';
    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    return 'Data inválida';
  }
};


/**
 * Formata horário
 * @param {string} horario - Horário no formato HH:MM ou HH:MM:SS
 * @returns {string} Horário formatado (HH:MM)
 */
export const formatarHorario = (horario) => {
  if (!horario) return 'Não informado';
  
  // Se já está no formato HH:MM ou HH:MM:SS, extrai apenas HH:MM
  const match = horario.match(/^(\d{2}):(\d{2})/);
  
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  
  return horario;
};
