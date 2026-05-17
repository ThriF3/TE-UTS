import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { GorLocationService } from '../services/gorLocationService.js';

export class GorLocationController {
    // Create
    static async createGorLocation(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return sendError(res, 'Not authenticated', 401);
            }

            const { name, address, city, province, phone, email, manager_id, is_active } = req.body;

            const gorLocation = await GorLocationService.createGorLocation({
                name,
                address,
                city,
                province,
                phone,
                email,
                manager_id,
                is_active,
            })
            sendSuccess(res, 'Gor location created successfully', gorLocation, 201);
        } catch (error) {
            return sendError(res, (error as any).message || 'Failed to create gor location', 500, error);
        }
    }

    // Get
    static async getGorLocationById(req: AuthenticatedRequest, res: Response) {
        try {
            const gorLocation = await GorLocationService.getGorLocationById(BigInt(req.params.id));
            if (!gorLocation) {
                return sendError(res, 'Gor location not found', 404);
            }
            sendSuccess(res, 'Gor location found', gorLocation, 200);
        } catch (error) {
            return sendError(res, (error as any).message || 'Failed to get gor location', 500, error);
        }
    }

    // List
    static async listGorLocations(req: AuthenticatedRequest, res: Response) {
        try {
            const gorLocations = await GorLocationService.listGorLocations(req.query);
            sendSuccess(res, 'Gor locations found', gorLocations, 200);
        } catch (error) {
            return sendError(res, (error as any).message || 'Failed to list gor locations', 500, error);
        }
    }

    // Update
    static async updateGorLocation(req: AuthenticatedRequest, res: Response) {
        try {
            const gorLocation = await GorLocationService.updateGorLocation(BigInt(req.params.id), req.body);
            sendSuccess(res, 'Gor location updated successfully', gorLocation, 200);
        } catch (error) {
            return sendError(res, (error as any).message || 'Failed to update gor location', 500, error);
        }
    }

    // Set Active
    static async setActive(req: AuthenticatedRequest, res: Response) {
        try {
            const gorLocation = await GorLocationService.setActive(BigInt(req.params.id), req.body.is_active);
            sendSuccess(res, 'Gor location active status updated successfully', gorLocation, 200);
        } catch (error) {
            return sendError(res, (error as any).message || 'Failed to update gor location active status', 500, error);
        }
    }

    // Delete
    static async deleteGorLocation(req: AuthenticatedRequest, res: Response) {
        try {
            const gorLocation = await GorLocationService.deleteGorLocation(BigInt(req.params.id));
            sendSuccess(res, 'Gor location deleted successfully', gorLocation, 200);
        } catch (error) {
            return sendError(res, (error as any).message || 'Failed to delete gor location', 500, error);
        }
    }
}
