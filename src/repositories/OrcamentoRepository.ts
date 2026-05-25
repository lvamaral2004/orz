import { getDatabase } from '../database/db';
import { Orcamento, OrcamentoCreate } from '../models';

export class OrcamentoRepository {
    // ─── Consultas ────────────────────────────────────────────────────────────

    async findAll(): Promise<Orcamento[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync<any>(
            `SELECT o.*, c.nome AS cliente_nome
             FROM orcamentos o
             LEFT JOIN clientes c ON c.id = o.cliente_id
             ORDER BY o.created_at DESC`
        );
        return rows.map(this.mapRow);
    }

    async findById(id: number): Promise<Orcamento | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync<any>(
            `SELECT o.*, c.nome AS cliente_nome
             FROM orcamentos o
             LEFT JOIN clientes c ON c.id = o.cliente_id
             WHERE o.id = ?`,
            [id]
        );
        if (!row) return null;

        const servicos = await db.getAllAsync<any>(
            `SELECT * FROM orcamento_servicos WHERE orcamento_id = ?`,
            [id]
        );

        return {
            ...this.mapRow(row),
            servicos: servicos.map(this.mapServicoRow),
        };
    }

    async findByMonth(date: Date): Promise<Orcamento[]> {
        const db = await getDatabase();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}-${month}`;

        const rows = await db.getAllAsync<any>(
            `SELECT o.*, c.nome AS cliente_nome
             FROM orcamentos o
             LEFT JOIN clientes c ON c.id = o.cliente_id
             WHERE strftime('%Y-%m', o.created_at) = ?
             ORDER BY o.created_at DESC`,
            [prefix]
        );

        const orcamentos = await Promise.all(rows.map(async (row) => {
            const servicos = await db.getAllAsync<any>(
                `SELECT * FROM orcamento_servicos WHERE orcamento_id = ?`,
                [row.id]
            );
            return { ...this.mapRow(row), servicos: servicos.map(this.mapServicoRow) };
        }));

        return orcamentos;
    }

    // ─── Mutações ─────────────────────────────────────────────────────────────

    async create(data: OrcamentoCreate): Promise<number> {
        const db = await getDatabase();
        const result = await db.runAsync(
            `INSERT INTO orcamentos
               (cliente_id, numero, status, validade_dias, observacoes, desconto_centavos)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.clienteId ?? null,
                data.numero,
                data.status,
                data.validadeDias,
                data.observacoes ?? null,
                data.descontoCentavos,
            ]
        );
        return result.lastInsertRowId;
    }

    async updateStatus(id: number, status: Orcamento['status']): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `UPDATE orcamentos SET status = ?, updated_at = datetime('now') WHERE id = ?`,
            [status, id]
        );
    }

    async delete(id: number): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM orcamentos WHERE id = ?`, [id]);
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private mapRow(row: any): Orcamento {
        return {
            id: row.id,
            clienteId: row.cliente_id ?? undefined,
            clienteNome: row.cliente_nome ?? undefined,
            numero: row.numero,
            status: row.status,
            validadeDias: row.validade_dias,
            observacoes: row.observacoes ?? undefined,
            descontoCentavos: row.desconto_centavos,
            servicos: [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapServicoRow(row: any) {
        return {
            id: row.id,
            orcamentoId: row.orcamento_id,
            servicoId: row.servico_id,
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
    }
}
