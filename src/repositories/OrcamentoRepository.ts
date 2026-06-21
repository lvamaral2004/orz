import { supabase } from '../supabase/client';
import { Orcamento, OrcamentoCreate } from '../models';

export class OrcamentoRepository {
    // ─── Consultas ────────────────────────────────────────────────────────────

    async findAll(): Promise<Orcamento[]> {
        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                clientes (
                    nome
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar orçamentos:', error);
            throw new Error(error.message);
        }

        return (data || []).map(this.mapRow);
    }

    async findById(id: number): Promise<Orcamento | null> {
        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                clientes (
                    nome
                ),
                orcamento_servicos (
                    *
                )
            `)
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Erro ao buscar orçamento por ID:', error);
            throw new Error(error.message);
        }

        if (!data) return null;

        const orcamento = this.mapRow(data);
        orcamento.servicos = (data.orcamento_servicos || []).map(this.mapServicoRow);
        return orcamento;
    }

    async findByMonth(date: Date): Promise<Orcamento[]> {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 1).toISOString();

        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                clientes (
                    nome
                ),
                orcamento_servicos (
                    *
                )
            `)
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar orçamentos do mês:', error);
            throw new Error(error.message);
        }

        return (data || []).map((row) => {
            const orcamento = this.mapRow(row);
            orcamento.servicos = (row.orcamento_servicos || []).map(this.mapServicoRow);
            return orcamento;
        });
    }

    // ─── Mutações ─────────────────────────────────────────────────────────────

    async create(data: OrcamentoCreate): Promise<number> {
        const { data: inserted, error } = await supabase
            .from('orcamentos')
            .insert({
                cliente_id: data.clienteId || null,
                numero: data.numero,
                status: data.status,
                validade_dias: data.validadeDias,
                observacoes: data.observacoes || null,
                desconto_centavos: data.descontoCentavos,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erro ao criar orçamento:', error);
            throw new Error(error.message);
        }

        return Number(inserted.id);
    }

    /** Cria o orçamento com todos os seus serviços (snapshot de preços) */
    async createComServicos(
        data: OrcamentoCreate,
        servicos: Array<{
            servicoId: number;
            descricaoSnapshot: string;
            quantidade: number;
            precoVendaUnitarioCentavos: number;
            custoTotalCentavos: number;
        }>
    ): Promise<number> {
        const orcamentoId = await this.create(data);

        if (servicos.length > 0) {
            const rowsToInsert = servicos.map((s) => ({
                orcamento_id: orcamentoId,
                servico_id: s.servicoId,
                quantidade: s.quantidade,
                preco_venda_unitario_centavos: s.precoVendaUnitarioCentavos,
                custo_total_centavos: s.custoTotalCentavos,
                descricao_snapshot: s.descricaoSnapshot,
            }));

            const { error: insertError } = await supabase
                .from('orcamento_servicos')
                .insert(rowsToInsert);

            if (insertError) {
                console.error('Erro ao vincular serviços ao orçamento:', insertError);
                throw new Error(insertError.message);
            }
        }

        return orcamentoId;
    }

    async updateStatus(id: number, status: Orcamento['status']): Promise<void> {
        const { error } = await supabase
            .from('orcamentos')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar status do orçamento:', error);
            throw new Error(error.message);
        }
    }

    async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from('orcamentos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir orçamento:', error);
            throw new Error(error.message);
        }
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private mapRow = (row: any): Orcamento => {
        return {
            id: Number(row.id),
            clienteId: row.cliente_id ? Number(row.cliente_id) : undefined,
            clienteNome: row.clientes?.nome ?? undefined,
            numero: row.numero,
            status: row.status,
            validadeDias: row.validade_dias,
            observacoes: row.observacoes ?? undefined,
            descontoCentavos: row.desconto_centavos,
            servicos: [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    };

    private mapServicoRow = (row: any) => {
        return {
            id: Number(row.id),
            orcamentoId: Number(row.orcamento_id),
            servicoId: Number(row.servico_id),
            descricaoSnapshot: row.descricao_snapshot,
            quantidade: row.quantidade,
            precoVendaUnitarioCentavos: row.preco_venda_unitario_centavos,
            custoTotalCentavos: row.custo_total_centavos,
            get subtotalVendaCentavos() {
                return row.preco_venda_unitario_centavos * row.quantidade;
            },
            get subtotalCustoCentavos() {
                return row.custo_total_centavos * row.quantidade;
            },
        };
    };
}
