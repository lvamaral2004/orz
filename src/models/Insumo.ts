export interface Insumo {
    id: number;
    nome: string;
    descricao?: string;
    unidade: 'un' | 'kg' | 'l' | 'h' | 'm' | 'cx';
    precoCustoCentavos: number;
    categoria?: string;
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InsumoCreate extends Omit<Insumo, 'id' | 'createdAt' | 'updatedAt'> {}
