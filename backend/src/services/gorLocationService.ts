import { pool } from '../config/database.js';
import { GorLocation } from '../types/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class GorLocationService {
    static async createGorLocation(
        data: Partial<GorLocation> & { manager_id: bigint }
    ): Promise<GorLocation> {
        const { name, address, city, province, phone, email, manager_id } = data;

        // Validate required fields
        if (!name?.trim()) {
            throw new ValidationError('Name is required');
        }
        if (!address?.trim()) {
            throw new ValidationError('Address is required');
        }
        if (!city?.trim()) {
            throw new ValidationError('City is required');
        }
        if (!province?.trim()) {
            throw new ValidationError('Province is required');
        }
        if (!manager_id) {
            throw new ValidationError('Manager ID is required');
        }

        try {
            const [result] = await pool.query<any>(
                `INSERT INTO gor_locations 
             (name, address, city, province, phone, email, manager_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    address,
                    city,
                    province,
                    phone || null,
                    email || null,
                    manager_id,
                ]
            );

            const gotLocation = await this.getGorLocationById(result.insertId)
            if (!gotLocation) {
                throw new Error('Failed to create gor location');
            }
            return gotLocation;
        } catch (error) {
            throw error;
        }
    }

    // Get
    static async getGorLocationById(id: bigint): Promise<GorLocation | null> {
        try {
            const [rows] = await pool.query<any[]>('SELECT * FROM gor_locations WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // List
    static async listGorLocations(
        params: {
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<GorLocation[]> {
        try {
            const query = `SELECT * FROM gor_locations WHERE 1=1`;
            const [rows] = await pool.query<any[]>(query, []);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update
    static async updateGorLocation(
        id: bigint,
        updates: Partial<GorLocation>
    ): Promise<GorLocation> {
        const { name, address, city, province, phone, email, manager_id } = updates;

        // Validate that updates object is not empty
        if (Object.keys(updates).length === 0) {
            throw new ValidationError('Updates object cannot be empty');
        }

        // Get the existing location to ensure it exists
        const existingLocation = await this.getGorLocationById(id);
        if (!existingLocation) {
            throw new NotFoundError('Gor location not found');
        }

        // Build the update query dynamically
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
        }

        // Add updated_at timestamp
        updateFields.push('updated_at = CURRENT_TIMESTAMP');

        // Add the id to the values array for the WHERE clause
        updateValues.push(id);

        try {
            // Execute the update query
            await pool.query<any>(
                `UPDATE gor_locations SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );

            // Return the updated location
            const updatedLocation = await this.getGorLocationById(id);
            if (!updatedLocation) {
                throw new Error('Failed to update gor location');
            }
            return updatedLocation;
        } catch (error) {
            throw error;
        }
    }

    static async setActive(
        id: bigint,
        isActive: boolean
    ): Promise<GorLocation> {
        try {
            const [result] = await pool.query<any>(
                `UPDATE gor_locations SET is_active = ? WHERE id = ?`,
                [isActive ? 1 : 0, id]
            );
            if (result.affectedRows === 0) {
                throw new NotFoundError('Gor location not found');
            }
            const updatedLocation = await this.getGorLocationById(id);
            if (!updatedLocation) {
                throw new Error('Failed to update gor location');
            }
            return updatedLocation;
        } catch (error) {
            throw error;
        }
    }

    // Delete
    static async deleteGorLocation(id: bigint): Promise<void> {
        try {
            const [result] = await pool.query<any>(
                `UPDATE gor_locations SET is_active = 0 WHERE id = ?`,
                [id]
            );
            if (result.affectedRows === 0) {
                throw new NotFoundError('Gor location not found');
            }
        } catch (error) {
            throw error;
        }
    }

}
