import { getDatabase } from '../database/db';
import { Servico, ServicoCreate } from '../models';

export class ServicoRepository {
    async findAll(apenasAtivos = true): Promise<Servico[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync<any>(
            `SELECT * FROM servicos ${apenasAtivos ? 'WHERE ativo = 1' : ''}
             ORDER BY nome ASC`
        );

        const servicos = await Promise.all(rows.map(async (row) => {
            const insumos = await db.getAllAsync<any>(
                `SELECT si.*, i.nome AS insumo_nome
                 FROM servico_insumos si
                 JOIN insumos i ON i.id = si.insumo_id
                 WHERE si.servico_id = ?`,
                [row.id]
            );
            return { ...this.mapRow(row), insumos: insumos.map(this.mapInsumoRow) };
        }));

        return servicos;
    }

    async findById(id: number): Promise<Servico | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync<any>(
            `SELECT * FROM servicos WHERE id = ?`,
            [id]
        );
        if (!row) return null;

        const insumos = await db.getAllAsync<any>(
            `SELECT si.*, i.nome AS insumo_nome
             FROM servico_insumos si
             JOIN insumos i ON i.id = si.insumo_id
             WHERE si.servico_id = ?`,
            [id]
        );

        return { ...this.mapRow(row), insumos: insumos.map(this.mapInsumoRow) };
    }

    async create(data: ServicoCreate): Promise<number> {
        const db = await getDatabase();
        const result = await db.runAsync(
            `INSERT INTO servicos (nome, descricao, preco_venda_centavos, tempo_estimado_minutos, ativo)
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.nome,
                data.descricao ?? null,
                data.precoVendaCentavos,
                data.tempoEstimadoMinutos ?? null,
                data.ativo ? 1 : 0,
            ]
        );
        return result.lastInsertRowId;
    }

    async update(id: number, data: Partial<ServicoCreate>): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `UPDATE servicos SET
               nome = COALESCE(?, nome),
               descricao = COALESCE(?, descricao),
               preco_venda_centavos = COALESCE(?, preco_venda_centavos),
               tempo_estimado_minutos = COALESCE(?, tempo_estimado_minutos),
               ativo = COALESCE(?, ativo),
               updated_at = datetime('now')
             WHERE id = ?`,
            [
                data.nome ?? null,
                data.descricao ?? null,
                data.precoVendaCentavos ?? null,
                data.tempoEstimadoMinutos ?? null,
                data.ativo !== undefined ? (data.ativo ? 1 : 0) : null,
                id,
            ]
        );
    }

    async delete(id: number): Promise<void> {
        const db = await getDatabase();
        // Soft delete — preserva histórico em orçamentos
        await db.runAsync(
            `UPDATE servicos SET ativo = 0, updated_at = datetime('now') WHERE id = ?`,
            [id]
        );
    }

    private mapRow(row: any): Omit<Servico, 'insumos'> {
        return {
            id: row.id,
            nome: row.nome,
            descricao: row.descricao ?? undefined,
            precoVendaCentavos: row.preco_venda_centavos,
            tempoEstimadoMinutos: row.tempo_estimado_minutos ?? undefined,
            ativo: row.ativo === 1,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapInsumoRow(row: any) {
        return {
            id: row.id,
            servicoId: row.servico_id,
            insumoId: row.insumo_id,
            insumoNome: row.insumo_nome,
            quantidade: row.quantidade,
            precoCustoUnitarioCentavos: row.preco_custo_unitario_centavos,
            get subtotalCentavos() {
                return row.preco_custo_unitario_centavos * row.quantidade;
            },
        };
    }
}
