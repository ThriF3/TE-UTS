import { pool } from '../config/database.js';
import { Payment, CreatePaymentInput } from '../types/index.js';

export class PaymentService {
    /**
     * Insert a payment record for a transaction.
     */
    static async createPayment(input: CreatePaymentInput): Promise<Payment> {
        const [result]: any = await pool.execute(
            `INSERT INTO payments
         (transaction_id, payment_method, amount, cash_received, cash_change,
          card_number, card_bank, digital_provider, reference_no, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                input.transaction_id,
                input.payment_method,
                input.amount,
                input.cash_received ?? null,
                input.cash_change ?? null,
                input.card_number ?? null,
                input.card_bank ?? null,
                input.digital_provider ?? null,
                input.reference_no ?? null,
                input.status ?? 'success',
                input.notes ?? null,
            ]
        );

        const [rows]: any = await pool.execute(
            'SELECT * FROM payments WHERE id = ?',
            [result.insertId]
        );

        return rows[0] as Payment;
    }

    /**
     * Fetch all payments for a given transaction.
     */
    static async getPaymentsByTransactionId(
        transactionId: bigint
    ): Promise<Payment[]> {
        const [rows]: any = await pool.execute(
            'SELECT * FROM payments WHERE transaction_id = ? ORDER BY processed_at',
            [transactionId]
        );
        return rows as Payment[];
    }

    /**
     * Update payment status and reference
     */
    static async updatePaymentStatus(
        transactionId: bigint,
        status: string,
        referenceNo?: string
    ): Promise<void> {
        let query = 'UPDATE payments SET status = ?';
        const params: any[] = [status];

        if (referenceNo) {
            query += ', reference_no = ?';
            params.push(referenceNo);
        }

        query += ' WHERE transaction_id = ?';
        params.push(transactionId);

        await pool.execute(query, params);
    }
}