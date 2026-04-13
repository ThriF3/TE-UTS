import { pool } from '../config/database.js';
import { User } from '../types/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';

export class AuthService {
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Database error: ${(error as any).message}`);
    }
  }

  static async getUserById(id: bigint): Promise<User | null> {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Database error: ${(error as any).message}`);
    }
  }

  static async createUser(userData: {
    role_id: number;
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    company_name?: string;
  }): Promise<User> {
    // Check if user exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    try {
      const [result] = await pool.query<any>(
        `INSERT INTO users (role_id, name, email, password_hash, phone, address, company_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.role_id,
          userData.name,
          userData.email,
          password_hash,
          userData.phone || null,
          userData.address || null,
          userData.company_name || null,
        ]
      );

      const newUser = await this.getUserById(BigInt(result.insertId));
      if (!newUser) {
        throw new Error('Failed to create user');
      }

      return newUser;
    } catch (error) {
      if ((error as any).message?.includes('Duplicate entry')) {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return comparePassword(plainPassword, hashedPassword);
  }

  static async updateProfile(userId: bigint, updateData: Partial<User>): Promise<User> {
    const allowedFields = ['name', 'phone', 'address', 'company_name'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    values.push(userId);

    try {
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
      const user = await this.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(
    userId: bigint,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(newPassword);

    try {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
        newPasswordHash,
        userId,
      ]);
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers(limit: number = 10, offset: number = 0): Promise<User[]> {
    try {
      const [rows] = await pool.query<any[]>(
        `SELECT u.*, r.name as role FROM users u 
         JOIN roles r ON u.role_id = r.id 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}
