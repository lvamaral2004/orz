import { supabase } from '../supabase/client';
import { Insumo, InsumoCreate } from '../models';

export class InsumoRepository {
    async findAll(apenasAtivos = true): Promise<Insumo[]> {
        let query = supabase
            .from('insumos')
            .select('*');

        if (apenasAtivos) {
            query = query.eq('ativo', true);
        }

        const { data, error } = await query.order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar insumos:', error);
            throw new Error(error.message);
        }

        return (data || []).map(this.mapRow);
    }

    async findById(id: number): Promise<Insumo | null> {
        const { data, error } = await supabase
            .from('insumos')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Erro ao buscar insumo por ID:', error);
            throw new Error(error.message);
        }

        return data ? this.mapRow(data) : null;
    }

    async create(data: InsumoCreate): Promise<number> {
        const { data: inserted, error } = await supabase
            .from('insumos')
            .insert({
                nome: data.nome,
                descricao: data.descricao || null,
                unidade: data.unidade,
                preco_custo_centavos: data.precoCustoCentavos,
                categoria: data.categoria || null,
                ativo: data.ativo ?? true,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erro ao criar insumo:', error);
            throw new Error(error.message);
        }

        return Number(inserted.id);
    }

    async update(id: number, data: Partial<InsumoCreate>): Promise<void> {
        const updateData: any = {};
        if (data.nome !== undefined) updateData.nome = data.nome;
        if (data.descricao !== undefined) updateData.descricao = data.descricao || null;
        if (data.unidade !== undefined) updateData.unidade = data.unidade;
        if (data.precoCustoCentavos !== undefined) updateData.preco_custo_centavos = data.precoCustoCentavos;
        if (data.categoria !== undefined) updateData.categoria = data.categoria || null;
        if (data.ativo !== undefined) updateData.ativo = data.ativo;
        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('insumos')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar insumo:', error);
            throw new Error(error.message);
        }
    }

    async delete(id: number): Promise<void> {
        // Soft delete — preserva histórico em orçamentos
        const { error } = await supabase
            .from('insumos')
            .update({ ativo: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao desativar insumo:', error);
            throw new Error(error.message);
        }
    }

    private mapRow(row: any): Insumo {
        return {
            id: Number(row.id),
            nome: row.nome,
            descricao: row.descricao ?? undefined,
            unidade: row.unidade,
            precoCustoCentavos: row.preco_custo_centavos,
            categoria: row.categoria ?? undefined,
            ativo: row.ativo === true,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
