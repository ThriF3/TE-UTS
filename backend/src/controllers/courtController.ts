// backend/src/controllers/courtController.ts
import { Request, Response, NextFunction } from 'express';
import { CourtService } from '../services/courtService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CourtController {
    /** GET /courts  */
    static async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit, offset, locationId, courtType, available, total } = req.query;
            const result = await CourtService.listCourts({
                limit: limit ? Number(limit) : undefined,
                offset: offset ? Number(offset) : undefined,
                locationId: locationId ? Number(locationId) : undefined,
                courtType: courtType as string | undefined,
                available: available ? available === 'true' : undefined,
            });
            const count = await CourtService.countCourts();
            return sendSuccess(res, 'Orders retrieved', {
                data: result,
                total: count,
                limit,
                offset,
            });
        } catch (err) {
            sendError(res, (err as any).message || 'Failed to get orders', 500, err);
        }
    }

    /** GET /courts/:id */
    static async get(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const court = await CourtService.getCourtById(id);
            res.json({ success: true, message: 'Court fetched', data: court, error: null });
        } catch (err) {
            next(err);
        }
    }

    /** POST /courts */
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = req.body;
            const court = await CourtService.createCourt(payload);
            res.status(201).json({ success: true, message: 'Court created', data: court, error: null });
        } catch (err) {
            next(err);
        }
    }

    /** PUT /courts/:id */
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const payload = req.body;
            const court = await CourtService.updateCourt(id, payload);
            res.json({ success: true, message: 'Court updated', data: court, error: null });
        } catch (err) {
            next(err);
        }
    }

    /** DELETE /courts/:id  (soft‑delete) */
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await CourtService.deleteCourt(id);
            res.json({ success: true, message: 'Court deleted', data: null, error: null });
        } catch (err) {
            next(err);
        }
    }
}
