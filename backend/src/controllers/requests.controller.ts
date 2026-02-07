import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { request_type, priority = 'normal', data } = req.body;
    const id = uuidv4();

    await db.none(`
      INSERT INTO employee_requests (id, employee_id, request_type, priority, data, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
    `, [id, userId, request_type, priority, JSON.stringify(data)]);

    const request = await db.one(`SELECT * FROM employee_requests WHERE id = $1`, [id]);

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { status, request_type, page = 1, limit = 20 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Employees only see their own requests
    if (userRole === 'employee') {
      whereClause += ` AND r.employee_id = $${paramIndex++}`;
      params.push(userId!);
    }

    if (status) {
      whereClause += ` AND r.status = $${paramIndex++}`;
      params.push(status as string);
    }
    if (request_type) {
      whereClause += ` AND r.request_type = $${paramIndex++}`;
      params.push(request_type as string);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const requests = await db.manyOrNone(`
      SELECT r.*, e.first_name, e.last_name, e.email
      FROM employee_requests r
      JOIN employees e ON r.employee_id = e.id
      ${whereClause}
      ORDER BY r.submitted_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, Number(limit), offset]);

    const countResult = await db.one<{ count: string }>(`
      SELECT COUNT(*) as count FROM employee_requests r ${whereClause}
    `, params);

    res.json({
      success: true,
      data: requests,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.count, 10),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const request = await db.oneOrNone(`
      SELECT r.*, e.first_name, e.last_name, e.email
      FROM employee_requests r
      JOIN employees e ON r.employee_id = e.id
      WHERE r.id = $1
    `, [id]);

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, priority, reviewer_notes } = req.body;

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'in_review') {
        fields.push(`reviewed_at = CURRENT_TIMESTAMP`);
      } else if (status === 'completed') {
        fields.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }
    if (priority) {
      fields.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }
    if (reviewer_notes) {
      fields.push(`reviewer_notes = $${paramIndex++}`);
      values.push(reviewer_notes);
    }

    if (fields.length === 0) {
      const request = await db.oneOrNone(`SELECT * FROM employee_requests WHERE id = $1`, [id]);
      if (!request) throw new NotFoundError('Request not found');
      res.json({ success: true, data: request });
      return;
    }

    const result = await db.oneOrNone(`
      UPDATE employee_requests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *
    `, [...values, id]);

    if (!result) {
      throw new NotFoundError('Request not found');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const result = await db.oneOrNone(`
      UPDATE employee_requests 
      SET assigned_to = $1, status = 'in_review', reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `, [assigned_to, id]);

    if (!result) {
      throw new NotFoundError('Request not found');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function approveRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { reviewer_notes } = req.body;
    const userId = req.user?.userId;

    const result = await db.oneOrNone(`
      UPDATE employee_requests 
      SET status = 'approved', 
          reviewed_at = CURRENT_TIMESTAMP, 
          completed_at = CURRENT_TIMESTAMP,
          assigned_to = $1,
          reviewer_notes = $2
      WHERE id = $3 
      RETURNING *
    `, [userId, reviewer_notes || 'Approved', id]);

    if (!result) {
      throw new NotFoundError('Request not found');
    }

    // Create notification for the requester
    await db.none(`
      INSERT INTO notifications (id, employee_id, type, title, message, priority)
      VALUES ($1, $2, 'request_approved', 'Request Approved', $3, 'normal')
    `, [uuidv4(), result.employee_id, `Your ${result.request_type.replace('_', ' ')} request has been approved.`]);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { reviewer_notes } = req.body;
    const userId = req.user?.userId;

    const result = await db.oneOrNone(`
      UPDATE employee_requests 
      SET status = 'rejected', 
          reviewed_at = CURRENT_TIMESTAMP,
          assigned_to = $1,
          reviewer_notes = $2
      WHERE id = $3 
      RETURNING *
    `, [userId, reviewer_notes || 'Rejected', id]);

    if (!result) {
      throw new NotFoundError('Request not found');
    }

    // Create notification for the requester
    await db.none(`
      INSERT INTO notifications (id, employee_id, type, title, message, priority)
      VALUES ($1, $2, 'request_rejected', 'Request Rejected', $3, 'normal')
    `, [uuidv4(), result.employee_id, `Your ${result.request_type.replace('_', ' ')} request has been rejected. Reason: ${reviewer_notes || 'Not specified'}`]);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
