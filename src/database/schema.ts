// Schema SQL — todas as tabelas do sistema
// Uso de INTEGER para valores monetários (centavos) evita problemas de ponto flutuante

export const SQL_CREATE_TABLES = `
  -- Clientes dos orçamentos
  CREATE TABLE IF NOT EXISTS clientes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    telefone   TEXT,
    email      TEXT,
    endereco   TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Insumos/Recursos: peças, materiais, mão de obra avulsa
  CREATE TABLE IF NOT EXISTS insumos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT    NOT NULL,
    descricao       TEXT,
    unidade         TEXT    NOT NULL DEFAULT 'un',  -- 'un', 'kg', 'l', 'h', 'm'
    preco_custo_centavos INTEGER NOT NULL DEFAULT 0, -- Armazenado em centavos!
    categoria       TEXT,                           -- 'Material', 'Mão de Obra', 'Ferramenta'
    ativo           INTEGER NOT NULL DEFAULT 1,     -- Boolean: 1=true, 0=false
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Serviços: a "receita" que agrupa insumos
  CREATE TABLE IF NOT EXISTS servicos (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                     TEXT    NOT NULL,
    descricao                TEXT,
    preco_venda_centavos     INTEGER NOT NULL DEFAULT 0, -- Definido pelo profissional
    tempo_estimado_minutos   INTEGER,                    -- Opcional: duração prevista
    ativo                    INTEGER NOT NULL DEFAULT 1,
    created_at               TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at               TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Tabela pivot: quais insumos compõem cada serviço e em qual quantidade
  CREATE TABLE IF NOT EXISTS servico_insumos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    insumo_id  INTEGER NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    quantidade REAL    NOT NULL DEFAULT 1,
    -- Preço de custo é "congelado" no momento da criação da receita
    -- para preservar histórico mesmo se o insumo mudar de preço:
    preco_custo_unitario_centavos INTEGER NOT NULL,
    UNIQUE(servico_id, insumo_id)
  );

  -- Orçamentos enviados para clientes
  CREATE TABLE IF NOT EXISTS orcamentos (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id       INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    numero           TEXT    NOT NULL UNIQUE, -- Ex: "ORC-2024-001"
    status           TEXT    NOT NULL DEFAULT 'rascunho', -- 'rascunho', 'enviado', 'aprovado', 'recusado'
    validade_dias    INTEGER NOT NULL DEFAULT 15,
    observacoes      TEXT,
    desconto_centavos INTEGER NOT NULL DEFAULT 0,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Tabela pivot: serviços incluídos em cada orçamento
  -- Preços são CONGELADOS no momento da inclusão (snapshot histórico)
  CREATE TABLE IF NOT EXISTS orcamento_servicos (
    id                           INTEGER PRIMARY KEY AUTOINCREMENT,
    orcamento_id                 INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    servico_id                   INTEGER NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    quantidade                   INTEGER NOT NULL DEFAULT 1,
    -- Snapshot do preço de venda no momento do orçamento:
    preco_venda_unitario_centavos INTEGER NOT NULL,
    -- Snapshot do custo total dos insumos deste serviço no momento do orçamento:
    custo_total_centavos          INTEGER NOT NULL,
    descricao_snapshot            TEXT    NOT NULL  -- Nome do serviço congelado
  );
`;

// Índices para performance em consultas frequentes
export const SQL_CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_servico_insumos_servico ON servico_insumos(servico_id);
  CREATE INDEX IF NOT EXISTS idx_orcamento_servicos_orcamento ON orcamento_servicos(orcamento_id);
  CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
  CREATE INDEX IF NOT EXISTS idx_orcamentos_numero ON orcamentos(numero);
`;