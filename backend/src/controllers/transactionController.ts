import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { TransactionService } from '../services/transactionService.js';
import { TransactionItemService } from '../services/transactionItemService.js';
import { PaymentService } from '../services/paymentService.js';
import { StockService } from '../services/stockService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateTransactionItemInput, CreatePaymentInput } from '../types/index.js';
import { snap, coreApi } from '../config/midtrans.js';
import crypto from 'crypto';

// ─── Shape coming from POSPage ────────────────────────────────────────────────
//  "customer_id": 1,
//  "subtotal": 150000,
//  "discount_amt": 15000,
//  "tax_pct": 11,
//  "tax_amt": 14850,
//   "total_amount": 149850,
//   "status": "completed",

//   "items": [
//     {
//       "item_id": "42",
//       "item_name": "Shuttlecock RSL",
//       "quantity": 3,
//       "unit": "Pcs",
//       "unit_price": 50000,
//       "subtotal": 150000
//     }
//   ],

//   "payment": {
//     "method": "cash",
//     "amount": 149850,
//     "cash_received": 200000
//   }
// }
//
// ─────────────────────────────────────────────────────────────────────────────

export class TransactionController {
  static async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const {
        order_id,
        contract_id,
        customer_id,
        subtotal,
        discount_amt,
        tax_pct,
        tax_amt,
        total_amount,
        status,
        items,   // CartItem[]  — required for POS transactions
        payment, // PaymentInput — required for POS transactions
      } = req.body;

      // ── Validation ──────────────────────────────────────────────────────────
      if (!customer_id || total_amount === undefined) {
        return sendError(res, 'Missing required fields: customer_id, total_amount', 400);
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'At least one item is required', 400);
      }

      if (!payment || !payment.method) {
        return sendError(res, 'Payment information is required', 400);
      }

      if (payment.method === 'cash') {
        const received = parseFloat(payment.cash_received);
        if (!received || received < parseFloat(total_amount)) {
          return sendError(res, 'Cash received is less than total amount', 400);
        }
      }

      // ── 1. Create the parent transaction ────────────────────────────────────
      const transaction = await TransactionService.createTransaction({
        order_id: order_id ? BigInt(order_id) : undefined,
        contract_id: contract_id ? BigInt(contract_id) : undefined,
        customer_id: BigInt(customer_id),
        kasir_id: req.user.userId,
        subtotal: parseFloat(subtotal) || 0,
        discount_amt: parseFloat(discount_amt) || 0,
        tax_pct: parseFloat(tax_pct) || 0,
        tax_amt: parseFloat(tax_amt) || 0,
        total_amount: parseFloat(total_amount),
        status: payment.method === 'cash' ? (status || 'completed') : 'open',
      });

      const transactionId = transaction.id;

      // ── 2. Insert transaction items ──────────────────────────────────────────
      // POSPage sends: { item_id, quantity, unit_price, subtotal }
      // We enrich with item_name + unit from the request (or fall back to defaults)
      const itemInputs: CreateTransactionItemInput[] = items.map((i: any) => ({
        transaction_id: transactionId,
        stock_item_id: i.item_id ? BigInt(i.item_id) : undefined,
        item_name: i.item_name || i.itemName || 'Unknown Item',
        quantity: parseFloat(i.quantity),
        unit: i.unit || 'Pcs',
        unit_price: parseFloat(i.unit_price ?? i.unitPrice),
        discount_pct: parseFloat(i.discount_pct ?? i.discount ?? 0),
        subtotal: parseFloat(i.subtotal),
      }));

      const transactionItems = await TransactionItemService.createItems(itemInputs);

      // ── Deduct Stock ─────────────────────────────────────────────────────────
      for (const item of itemInputs) {
        if (item.stock_item_id) {
          await StockService.updateStockQuantity(item.stock_item_id, -item.quantity);
        }
      }

      // ── 3. Insert payment record ─────────────────────────────────────────────
      const cashReceived =
        payment.cash_received !== undefined
          ? parseFloat(payment.cash_received)
          : undefined;

      const cashChange =
        cashReceived !== undefined
          ? cashReceived - parseFloat(total_amount)
          : undefined;

      const paymentInput: CreatePaymentInput = {
        transaction_id: transactionId,
        payment_method: payment.method as 'cash' | 'debit' | 'credit' | 'digital',
        amount: parseFloat(payment.amount ?? total_amount),
        cash_received: cashReceived,
        cash_change: cashChange,
        card_number: payment.card_number ?? undefined,
        card_bank: payment.card_bank ?? undefined,
        digital_provider: payment.digital_provider ?? undefined,
        reference_no: payment.reference_no ?? undefined,
        status: (payment.status as any) ?? 'success',
        notes: payment.notes ?? undefined,
      };

      // Set digital/card payment status to pending initially
      if (payment.method !== 'cash') {
        paymentInput.status = 'pending';
      }

      const paymentRecord = await PaymentService.createPayment(paymentInput);

      // ── 3.5. Midtrans Integration ──────────────────────────────────────────
      let snapToken = null;
      let snapRedirectUrl = null;

      if (payment.method !== 'cash') {
        const parameter = {
          transaction_details: {
            order_id: `TRX-${transaction.no_transaksi}-${Date.now()}`,
            gross_amount: Math.round(parseFloat(total_amount)),
          },
          customer_details: {
            first_name: `Customer ID: ${customer_id}`,
          }
        };

        try {
          const snapResponse = await snap.createTransaction(parameter);
          snapToken = snapResponse.token;
          snapRedirectUrl = snapResponse.redirect_url;
        } catch (midtransError: any) {
          console.error('Midtrans Error:', midtransError);
          return sendError(res, 'Failed to connect to Payment Gateway', 500, midtransError);
        }
      }

      // ── 4. Return the full transaction payload ───────────────────────────────
      return sendSuccess(
        res,
        'Transaction created successfully',
        {
          ...transaction,
          items: transactionItems,
          payment: paymentRecord,
          snapToken,
          snapRedirectUrl
        },
        201
      );
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to create transaction',
        500,
        error
      );
    }
  }

  static async getTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const transaction = await TransactionService.getTransactionById(BigInt(id));
      if (!transaction) {
        return sendError(res, 'Transaction not found', 404);
      }

      // Enrich with items and payment when fetching a single transaction
      const [items, payments] = await Promise.all([
        TransactionItemService.getItemsByTransactionId(transaction.id),
        PaymentService.getPaymentsByTransactionId(transaction.id),
      ]);

      return sendSuccess(res, 'Transaction retrieved', {
        ...transaction,
        items,
        payments,
      });
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to get transaction',
        500,
        error
      );
    }
  }

  static async getAllTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const customerId = req.query.customer_id
        ? BigInt(req.query.customer_id as string)
        : undefined;

      const transactions = await TransactionService.getAllTransactions(limit, offset, customerId);
      const total = await TransactionService.countTransactions();

      return sendSuccess(res, 'Transactions retrieved', {
        data: transactions,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to get transactions',
        500,
        error
      );
    }
  }

  static async getTransactionStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await TransactionService.getTransactionStats();
      return sendSuccess(res, 'Transaction stats retrieved', stats);
    } catch (error) {
      return sendError(
        res,
        (error as any).message || 'Failed to get stats',
        500,
        error
      );
    }
  }

  // ── Midtrans Webhook ───────────────────────────────────────────────────
  static async midtransNotification(req: any, res: Response) {
    try {
      const notificationJson = req.body;
      
      const statusResponse = await (coreApi as any).transaction.notification(notificationJson);
      
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      // Extract our no_transaksi from Midtrans order_id (Format: TRX-TRX/YYYYMMDD/NNNN-timestamp)
      // Actually order_id looks like: TRX-TRX/20260517/0001-123456789
      // Let's parse it safely
      const parts = orderId.split('-');
      // If our format is `TRX-${transaction.no_transaksi}-${Date.now()}` and no_transaksi has slashes like TRX/20260517/0001
      // It becomes TRX-TRX/20260517/0001-1681234567
      const noTransaksi = parts.slice(1, -1).join('-'); 

      const transaction = await TransactionService.getTransactionByNo(noTransaksi);
      if (!transaction) {
        return res.status(404).send('Transaction not found');
      }

      let paymentStatus = 'pending';
      let txStatus: 'open' | 'completed' | 'cancelled' | 'refunded' = 'open';

      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          paymentStatus = 'pending';
        } else if (fraudStatus == 'accept') {
          paymentStatus = 'success';
          txStatus = 'completed';
        }
      } else if (transactionStatus == 'settlement') {
        paymentStatus = 'success';
        txStatus = 'completed';
      } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        paymentStatus = 'failed';
        txStatus = 'cancelled';
        
        // Return stock if cancelled
        if (transaction.status !== 'cancelled') {
          const items = await TransactionItemService.getItemsByTransactionId(transaction.id);
          for (const item of items) {
            if (item.stock_item_id) {
              await StockService.updateStockQuantity(item.stock_item_id, item.quantity);
            }
          }
        }
      } else if (transactionStatus == 'pending') {
        paymentStatus = 'pending';
      }

      await PaymentService.updatePaymentStatus(transaction.id, paymentStatus, orderId);
      
      if (txStatus !== 'open') {
        await TransactionService.updateTransactionStatus(transaction.id, txStatus);
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('Midtrans Notification Error:', error);
      return res.status(500).send('Internal Server Error');
    }
  }
}