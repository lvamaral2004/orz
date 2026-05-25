import { ServicoInsumo } from './ServicoInsumo';

export interface Servico {
    id: number;
    nome: string;
    descricao?: string;
    precoVendaCentavos: number;
    tempoEstimadoMinutos?: number;
    ativo: boolean;
    insumos: ServicoInsumo[];
    createdAt: string;
    updatedAt: string;
}

export interface ServicoCreate extends Omit<Servico, 'id' | 'insumos' | 'createdAt' | 'updatedAt'> {}
