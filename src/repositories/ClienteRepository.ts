import { supabase } from '../supabase/client';
import { Cliente, ClienteCreate } from '../models';

export class ClienteRepository {
    async findAll(): Promise<Cliente[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            throw new Error(error.message);
        }

        return (data || []).map(this.mapRow);
    }

    async findById(id: number): Promise<Cliente | null> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Erro ao buscar cliente por ID:', error);
            throw new Error(error.message);
        }

        return data ? this.mapRow(data) : null;
    }

    async create(data: ClienteCreate): Promise<number> {
        const { data: inserted, error } = await supabase
            .from('clientes')
            .insert({
                nome: data.nome,
                telefone: data.telefone || null,
                email: data.email || null,
                endereco: data.endereco || null,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erro ao criar cliente:', error);
            throw new Error(error.message);
        }

        return Number(inserted.id);
    }

    async update(id: number, data: Partial<ClienteCreate>): Promise<void> {
        const updateData: any = {};
        if (data.nome !== undefined) updateData.nome = data.nome;
        if (data.telefone !== undefined) updateData.telefone = data.telefone || null;
        if (data.email !== undefined) updateData.email = data.email || null;
        if (data.endereco !== undefined) updateData.endereco = data.endereco || null;
        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('clientes')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw new Error(error.message);
        }
    }

    async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir cliente:', error);
            throw new Error(error.message);
        }
    }

    private mapRow(row: any): Cliente {
        return {
            id: Number(row.id),
            nome: row.nome,
            telefone: row.telefone ?? undefined,
            email: row.email ?? undefined,
            endereco: row.endereco ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
