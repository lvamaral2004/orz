import { getDatabase } from '../database/db';
import { Insumo, InsumoCreate } from '../models';

export class InsumoRepository {
    async findAll(apenasAtivos = true): Promise<Insumo[]> {
        const db = await getDatabase();
        const rows = await db.getAllAsync<any>(
            `SELECT * FROM insumos ${apenasAtivos ? 'WHERE ativo = 1' : ''}
             ORDER BY nome ASC`
        );
        return rows.map(this.mapRow);
    }

    async findById(id: number): Promise<Insumo | null> {
        const db = await getDatabase();
        const row = await db.getFirstAsync<any>(
            `SELECT * FROM insumos WHERE id = ?`,
            [id]
        );
        return row ? this.mapRow(row) : null;
    }

    async create(data: InsumoCreate): Promise<number> {
        const db = await getDatabase();
        const result = await db.runAsync(
            `INSERT INTO insumos (nome, descricao, unidade, preco_custo_centavos, categoria, ativo)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.nome,
                data.descricao ?? null,
                data.unidade,
                data.precoCustoCentavos,
                data.categoria ?? null,
                data.ativo ? 1 : 0,
            ]
        );
        return result.lastInsertRowId;
    }

    async update(id: number, data: Partial<InsumoCreate>): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `UPDATE insumos SET
               nome = COALESCE(?, nome),
               descricao = COALESCE(?, descricao),
               unidade = COALESCE(?, unidade),
               preco_custo_centavos = COALESCE(?, preco_custo_centavos),
               categoria = COALESCE(?, categoria),
               ativo = COALESCE(?, ativo),
               updated_at = datetime('now')
             WHERE id = ?`,
            [
                data.nome ?? null,
                data.descricao ?? null,
                data.unidade ?? null,
                data.precoCustoCentavos ?? null,
                data.categoria ?? null,
                data.ativo !== undefined ? (data.ativo ? 1 : 0) : null,
                id,
            ]
        );
    }

    async delete(id: number): Promise<void> {
        const db = await getDatabase();
        // Soft delete — preserva histórico em orçamentos
        await db.runAsync(
            `UPDATE insumos SET ativo = 0, updated_at = datetime('now') WHERE id = ?`,
            [id]
        );
    }

    private mapRow(row: any): Insumo {
        return {
            id: row.id,
            nome: row.nome,
            descricao: row.descricao ?? undefined,
            unidade: row.unidade,
            precoCustoCentavos: row.preco_custo_centavos,
            categoria: row.categoria ?? undefined,
            ativo: row.ativo === 1,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
