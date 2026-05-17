// backend/src/services/courtService.ts
import { pool } from '../config/database.js';
import { CourtUnit } from '../types/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

// Helper to format price as "Rp xx.xxx / jam"
function formatPrice(price: number): string {
    // keep two decimals, replace dot as thousands separator
    const formatted = price
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        .replace('.00', '');
    return `Rp ${formatted} / jam`;
}

export class CourtService {
    /** Validate payload for create / update */
    private static validate(payload: Partial<CourtUnit>) {
        if (!payload.gor_location_id) {
            throw new ValidationError('gor_location_id is required');
        }
        if (!payload.name?.trim()) {
            throw new ValidationError('name is required');
        }
        if (!payload.court_type) {
            throw new ValidationError('court_type is required');
        }
        if (payload.price_per_hour == null) {
            throw new ValidationError('price_per_hour is required');
        }
        const priceNum = Number(payload.price_per_hour);
        if (isNaN(priceNum) || priceNum <= 0) {
            throw new ValidationError('price_per_hour must be a number > 0');
        }
        if (payload.capacity != null && payload.capacity <= 0) {
            throw new ValidationError('capacity must be > 0');
        }
    }

    /** CREATE */
    static async createCourt(payload: Partial<CourtUnit>): Promise<CourtUnit> {
        this.validate(payload);
        const priceNum = Number(payload.price_per_hour);
        const [result] = await pool.query<any>(`
      INSERT INTO court_units
        (gor_location_id, name, court_type, price_per_hour, capacity, description, is_available)
      VALUES (?,?,?,?,?,?,?)
    `, [
            payload.gor_location_id,
            payload.name,
            payload.court_type,
            priceNum,
            payload.capacity ?? null,
            payload.description ?? null,
            payload.is_available ?? 1,
        ]);
        const insertedId = Number(result.insertId);
        return this.getCourtById(insertedId);
    }

    /** READ – single */
    static async getCourtById(id: number): Promise<CourtUnit> {
        const [rows] = await pool.query<any[]>(`
      SELECT * FROM court_units
      WHERE id = ? AND is_deleted = 0
    `, [id]);
        if (rows.length === 0) {
            throw new NotFoundError('Court not found');
        }
        return this.mapRowToCourt(rows[0]);
    }

    /** READ – list with pagination + optional filters */
    static async listCourts(params: {
        limit?: number;
        offset?: number;
        locationId?: number;
        courtType?: string;
        available?: boolean;
    }): Promise<{ data: CourtUnit[]; total: number }> {
        const { limit = 10, offset = 0, locationId, courtType, available } = params;
        const conditions: string[] = ['is_deleted = 0'];
        const values: any[] = [];

        if (locationId) {
            conditions.push('gor_location_id = ?');
            values.push(locationId);
        }
        if (courtType) {
            conditions.push('court_type = ?');
            values.push(courtType);
        }
        if (available !== undefined) {
            conditions.push('is_available = ?');
            values.push(available ? 1 : 0);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await pool.query<any[]>(`
      SELECT * FROM court_units ${where}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `, [...values, limit, offset]);

        const [countRows] = await pool.query<any[]>(`
      SELECT COUNT(*) as total FROM court_units ${where}
    `, values);

        const data = rows.map(this.mapRowToCourt);
        const total = countRows[0]?.total ?? 0;
        return { data, total };
    }

    /** UPDATE */
    static async updateCourt(
        id: number,
        payload: Partial<CourtUnit>
    ): Promise<CourtUnit> {
        this.validate(payload);
        const priceNum = Number(payload.price_per_hour);
        const fields: string[] = [];
        const values: any[] = [];

        if (payload.gor_location_id !== undefined) {
            fields.push('gor_location_id = ?');
            values.push(payload.gor_location_id);
        }
        if (payload.name !== undefined) {
            fields.push('name = ?');
            values.push(payload.name);
        }
        if (payload.court_type !== undefined) {
            fields.push('court_type = ?');
            values.push(payload.court_type);
        }
        if (payload.price_per_hour !== undefined) {
            fields.push('price_per_hour = ?');
            values.push(priceNum);
        }
        if (payload.capacity !== undefined) {
            fields.push('capacity = ?');
            values.push(payload.capacity);
        }
        if (payload.description !== undefined) {
            fields.push('description = ?');
            values.push(payload.description);
        }
        if (payload.is_available !== undefined) {
            fields.push('is_available = ?');
            values.push(payload.is_available ? 1 : 0);
        }

        if (!fields.length) {
            throw new ValidationError('No fields to update');
        }

        await pool.query(
            `UPDATE court_units SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`,
            [...values, id]
        );
        return this.getCourtById(id);
    }

    /** DELETE → soft‑delete */
    static async deleteCourt(id: number): Promise<void> {
        const [result] = await pool.query<any>(`
      UPDATE court_units SET is_deleted = 1 WHERE id = ?
    `, [id]);
        if (result.affectedRows === 0) {
            throw new NotFoundError('Court not found');
        }
    }

    /** ---------- helpers ---------- */
    private static mapRowToCourt(row: any): CourtUnit {
        return {
            id: Number(row.id),
            gor_location_id: Number(row.gor_location_id),
            name: row.name,
            court_type: row.court_type,
            price_per_hour: Number(row.price_per_hour),
            capacity: row.capacity != null ? Number(row.capacity) : undefined,
            description: row.description ?? undefined,
            is_available: Boolean(row.is_available),
            is_deleted: Boolean(row.is_deleted),
            created_at: new Date(row.created_at),
        };
    }

    static async countCourts(): Promise<number> {
        try {
            const [rows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM court_units');
            return rows[0]?.count || 0;
        } catch (error) {
            throw error;
        }
    }
}
