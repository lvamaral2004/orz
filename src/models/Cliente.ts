export interface Cliente {
    id: number;
    nome: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClienteCreate extends Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'> {}
