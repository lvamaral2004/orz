import { supabase } from '../supabase/client';
import { Servico, ServicoCreate } from '../models';

export class ServicoRepository {
    async findAll(apenasAtivos = true): Promise<Servico[]> {
        let query = supabase
            .from('servicos')
            .select(`
                *,
                servico_insumos (
                    id,
                    servico_id,
                    insumo_id,
                    quantidade,
                    preco_custo_unitario_centavos,
                    insumos (
                        nome
                    )
                )
            `);

        if (apenasAtivos) {
            query = query.eq('ativo', true);
        }

        const { data, error } = await query.order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar serviços:', error);
            throw new Error(error.message);
        }

        return (data || []).map(this.mapRowWithInsumos);
    }

    async findById(id: number): Promise<Servico | null> {
        const { data, error } = await supabase
            .from('servicos')
            .select(`
                *,
                servico_insumos (
                    id,
                    servico_id,
                    insumo_id,
                    quantidade,
                    preco_custo_unitario_centavos,
                    insumos (
                        nome
                    )
                )
            `)
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Erro ao buscar serviço por ID:', error);
            throw new Error(error.message);
        }

        return data ? this.mapRowWithInsumos(data) : null;
    }

    async create(data: ServicoCreate): Promise<number> {
        const { data: inserted, error } = await supabase
            .from('servicos')
            .insert({
                nome: data.nome,
                descricao: data.descricao || null,
                preco_venda_centavos: data.precoVendaCentavos,
                tempo_estimado_minutos: data.tempoEstimadoMinutos || null,
                ativo: data.ativo ?? true,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erro ao criar serviço:', error);
            throw new Error(error.message);
        }

        return Number(inserted.id);
    }

    /** Cria o serviço e já vincula os insumos */
    async createComInsumos(
        data: ServicoCreate,
        insumos: Array<{ insumoId: number; quantidade: number; precoCustoUnitarioCentavos: number }>
    ): Promise<number> {
        const servicoId = await this.create(data);

        if (insumos.length > 0) {
            await this.updateInsumos(servicoId, insumos);
        }

        return servicoId;
    }

    /** Substitui todos os insumos de um serviço */
    async updateInsumos(
        servicoId: number,
        insumos: Array<{ insumoId: number; quantidade: number; precoCustoUnitarioCentavos: number }>
    ): Promise<void> {
        const { error: deleteError } = await supabase
            .from('servico_insumos')
            .delete()
            .eq('servico_id', servicoId);

        if (deleteError) {
            console.error('Erro ao deletar insumos antigos do serviço:', deleteError);
            throw new Error(deleteError.message);
        }

        if (insumos.length > 0) {
            const rowsToInsert = insumos.map((i) => ({
                servico_id: servicoId,
                insumo_id: i.insumoId,
                quantidade: i.quantidade,
                preco_custo_unitario_centavos: i.precoCustoUnitarioCentavos,
            }));

            const { error: insertError } = await supabase
                .from('servico_insumos')
                .insert(rowsToInsert);

            if (insertError) {
                console.error('Erro ao inserir novos insumos no serviço:', insertError);
                throw new Error(insertError.message);
            }
        }
    }

    async update(id: number, data: Partial<ServicoCreate>): Promise<void> {
        const updateData: any = {};
        if (data.nome !== undefined) updateData.nome = data.nome;
        if (data.descricao !== undefined) updateData.descricao = data.descricao || null;
        if (data.precoVendaCentavos !== undefined) updateData.preco_venda_centavos = data.precoVendaCentavos;
        if (data.tempoEstimadoMinutos !== undefined) updateData.tempo_estimado_minutos = data.tempoEstimadoMinutos || null;
        if (data.ativo !== undefined) updateData.ativo = data.ativo;
        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('servicos')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar serviço:', error);
            throw new Error(error.message);
        }
    }

    async delete(id: number): Promise<void> {
        // Soft delete — preserva histórico em orçamentos
        const { error } = await supabase
            .from('servicos')
            .update({ ativo: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao desativar serviço:', error);
            throw new Error(error.message);
        }
    }

    private mapRowWithInsumos = (row: any): Servico => {
        const mappedInsumos = (row.servico_insumos || []).map((si: any) => {
            return {
                id: Number(si.id),
                servicoId: Number(si.servico_id),
                insumoId: Number(si.insumo_id),
                insumoNome: si.insumos?.nome || 'Insumo Excluído',
                quantidade: si.quantidade,
                precoCustoUnitarioCentavos: si.preco_custo_unitario_centavos,
                get subtotalCentavos() {
                    return si.preco_custo_unitario_centavos * si.quantidade;
                },
            };
        });

        return {
            id: Number(row.id),
            nome: row.nome,
            descricao: row.descricao ?? undefined,
            precoVendaCentavos: row.preco_venda_centavos,
            tempoEstimadoMinutos: row.tempo_estimado_minutos ?? undefined,
            ativo: row.ativo === true,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            insumos: mappedInsumos,
        };
    };
}
