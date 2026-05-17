import { pool } from '../config/database.js';
import {
    TransactionItem,
    CreateTransactionItemInput,
} from '../types/index.js';

export class TransactionItemService {
    /**
     * Bulk-insert items for a given transaction.
     * Returns the inserted rows with their generated IDs.
     */
    static async createItems(
        items: CreateTransactionItemInput[]
    ): Promise<TransactionItem[]> {
        if (items.length === 0) return [];

        // Build a multi-row INSERT
        const placeholders = items
            .map(() => '(?, ?, ?, ?, ?, ?, ?, ?)')
            .join(', ');

        const values = items.flatMap((i) => [
            i.transaction_id,
            i.stock_item_id ?? null,
            i.item_name,
            i.quantity,
            i.unit,
            i.unit_price,
            i.discount_pct ?? 0,
            i.subtotal,
        ]);

        const [result]: any = await pool.execute(
            `INSERT INTO transaction_items
         (transaction_id, stock_item_id, item_name, quantity, unit, unit_price, discount_pct, subtotal)
       VALUES ${placeholders}`,
            values
        );

        // Fetch back the inserted rows
        const firstId: number = result.insertId;
        const ids = items.map((_, idx) => firstId + idx);

        const [rows]: any = await pool.execute(
            `SELECT * FROM transaction_items WHERE id IN (${ids.map(() => '?').join(',')})`,
            ids
        );

        return rows as TransactionItem[];
    }

    /**
     * Fetch all items belonging to a transaction.
     */
    static async getItemsByTransactionId(
        transactionId: bigint
    ): Promise<TransactionItem[]> {
        const [rows]: any = await pool.execute(
            'SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id',
            [transactionId]
        );
        return rows as TransactionItem[];
    }
}