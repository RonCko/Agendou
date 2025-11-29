import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Agendou - Sistema de Agendamento de Clínicas',
      version: '1.0.0',
      description: `
# API RESTful para Agendamento de Clínicas

Sistema completo de agendamento com autenticação JWT, CRUD completo e regras de negócio.

## Características

- Autenticação JWT
- CRUD completo para todas entidades
- Controle de acesso por perfil (Paciente, Clínica)
- Verificação de disponibilidade de horários
- Dashboard com estatísticas
- Upload de imagens
- Filtros avançados

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas:

1. Faça login através do endpoint \`/auth/login\`
2. Copie o token retornado
3. Clique no botão **Authorize** no topo desta página
4. Digite: \`Bearer {seu_token}\` (substitua {seu_token} pelo token real)
5. Clique em **Authorize**

Agora você pode testar todas as rotas protegidas!

## Perfis de Usuário

- **paciente** - Pode criar e gerenciar seus agendamentos
- **clinica** - Pode gerenciar clínica, horários e consultas

## Regras de Negócio

- Não permite agendamentos duplicados no mesmo horário
- Valida se a clínica oferece a especialização
- Verifica horários de atendimento da clínica
- Não permite agendamentos em datas passadas
      `,
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints de registro, login e gerenciamento de perfil'
      },
      {
        name: 'Clínicas',
        description: 'Gerenciamento de clínicas, especializações e horários'
      },
      {
        name: 'Agendamentos',
        description: 'Criação e gerenciamento de agendamentos de consultas'
      },
      {
        name: 'Especializações',
        description: 'Listagem de especialidades médicas'
      },
      {
        name: 'Dashboard',
        description: 'Estatísticas e relatórios para clínicas e pacientes'
      },
      {
        name: 'Upload',
        description: 'Upload de imagens (fotos de perfil de clínicas)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Digite o token JWT no formato: Bearer {token}'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário',
              example: 1
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@email.com'
            },
            tipo: {
              type: 'string',
              enum: ['paciente', 'clinica', 'admin'],
              description: 'Tipo de usuário',
              example: 'paciente'
            },
            ativo: {
              type: 'boolean',
              description: 'Status do usuário',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        Paciente: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            usuario_id: {
              type: 'integer',
              example: 1
            },
            cpf: {
              type: 'string',
              example: '12345678900'
            },
            telefone: {
              type: 'string',
              example: '11999998888'
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              example: '1990-01-15'
            }
          }
        },
        Clinica: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            usuario_id: {
              type: 'integer',
              example: 2
            },
            nome: {
              type: 'string',
              example: 'Clínica Vida Saudável'
            },
            cnpj: {
              type: 'string',
              example: '12345678000199'
            },
            endereco: {
              type: 'string',
              example: 'Rua das Flores, 123'
            },
            cidade: {
              type: 'string',
              example: 'São Paulo'
            },
            estado: {
              type: 'string',
              example: 'SP'
            },
            telefone: {
              type: 'string',
              example: '1133334444'
            },
            foto_url: {
              type: 'string',
              example: 'http://localhost:3333/uploads/clinica1.jpg'
            },
            ativo: {
              type: 'boolean',
              example: true
            }
          }
        },
        Especializacao: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nome: {
              type: 'string',
              example: 'Cardiologia'
            },
            descricao: {
              type: 'string',
              example: 'Especialidade médica dedicada ao coração'
            },
            ativo: {
              type: 'boolean',
              example: true
            }
          }
        },
        Agendamento: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            clinica_id: {
              type: 'integer',
              example: 1
            },
            paciente_id: {
              type: 'integer',
              example: 1
            },
            especializacao_id: {
              type: 'integer',
              example: 1
            },
            data_agendamento: {
              type: 'string',
              format: 'date',
              example: '2025-02-15'
            },
            hora_agendamento: {
              type: 'string',
              format: 'time',
              example: '10:00'
            },
            status: {
              type: 'string',
              enum: ['pendente', 'confirmado', 'realizado', 'cancelado'],
              example: 'pendente'
            },
            observacoes: {
              type: 'string',
              example: 'Primeira consulta'
            },
            valor_consulta: {
              type: 'number',
              format: 'decimal',
              example: 250.00
            }
          }
        },
        HorarioAtendimento: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            clinica_id: {
              type: 'integer',
              example: 1
            },
            dia_semana: {
              type: 'integer',
              minimum: 0,
              maximum: 6,
              description: '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado',
              example: 1
            },
            hora_inicio: {
              type: 'string',
              format: 'time',
              example: '08:00'
            },
            hora_fim: {
              type: 'string',
              format: 'time',
              example: '12:00'
            },
            ativo: {
              type: 'boolean',
              example: true
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            erro: {
              type: 'string',
              example: 'Mensagem de erro'
            },
            mensagem: {
              type: 'string',
              example: 'Descrição detalhada do erro'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            mensagem: {
              type: 'string',
              example: 'Operação realizada com sucesso'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de autenticação inválido ou ausente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Token não fornecido'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acesso negado - Sem permissão',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Acesso negado'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Recurso não encontrado'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Requisição inválida - Dados incorretos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Dados inválidos',
                mensagem: 'Campo obrigatório não fornecido'
              }
            }
          }
        },
        ConflictError: {
          description: 'Conflito - Recurso já existe',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Já existe um agendamento neste horário'
              }
            }
          }
        }
      }
    },
    security: []
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
