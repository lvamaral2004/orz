import { OrcamentoStatus } from './OrcamentoStatus';
import { OrcamentoServico } from './OrcamentoServico';

export interface Orcamento {
    id: number;
    clienteId?: number;
    clienteNome?: string;
    numero: string;
    status: OrcamentoStatus;
    validadeDias: number;
    observacoes?: string;
    descontoCentavos: number;
    servicos: OrcamentoServico[];
    createdAt: string;
    updatedAt: string;
}

export interface OrcamentoCreate extends Omit<Orcamento, 'id' | 'servicos' | 'createdAt' | 'updatedAt'> {}
