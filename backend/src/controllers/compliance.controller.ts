import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getComplianceItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employee_id, item_type, status, jurisdiction, page = 1, limit = 20 } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Non-admins can only see their own compliance items
    if (userRole === 'employee') {
      whereClause += ` AND employee_id = $${paramIndex++}`;
      params.push(userId!);
    } else if (employee_id) {
      whereClause += ` AND employee_id = $${paramIndex++}`;
      params.push(employee_id as string);
    }

    if (item_type) {
      whereClause += ` AND item_type = $${paramIndex++}`;
      params.push(item_type as string);
    }
    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status as string);
    }
    if (jurisdiction) {
      whereClause += ` AND jurisdiction = $${paramIndex++}`;
      params.push(jurisdiction as string);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const items = await db.manyOrNone(`
      SELECT ci.*, e.first_name, e.last_name, e.email
      FROM compliance_items ci
      JOIN employees e ON ci.employee_id = e.id
      ${whereClause}
      ORDER BY expiration_date ASC NULLS LAST
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, Number(limit), offset]);

    const countResult = await db.one<{ count: string }>(`
      SELECT COUNT(*) as count FROM compliance_items ${whereClause}
    `, params);

    res.json({
      success: true,
      data: items,
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

export async function getComplianceItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const item = await db.oneOrNone(`
      SELECT ci.*, e.first_name, e.last_name, e.email
      FROM compliance_items ci
      JOIN employees e ON ci.employee_id = e.id
      WHERE ci.id = $1
    `, [id]);

    if (!item) {
      throw new NotFoundError('Compliance item not found');
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

export async function createComplianceItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employee_id, item_type, name, issuer, issue_date, expiration_date, jurisdiction, document_path, metadata } = req.body;
    const id = uuidv4();

    await db.none(`
      INSERT INTO compliance_items (id, employee_id, item_type, name, issuer, issue_date, expiration_date, jurisdiction, document_path, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [id, employee_id, item_type, name, issuer, issue_date, expiration_date, jurisdiction, document_path, JSON.stringify(metadata || {})]);

    const item = await db.one(`SELECT * FROM compliance_items WHERE id = $1`, [id]);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplianceItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && ['name', 'issuer', 'issue_date', 'expiration_date', 'status', 'document_path', 'metadata'].includes(key)) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) {
      const item = await db.oneOrNone(`SELECT * FROM compliance_items WHERE id = $1`, [id]);
      if (!item) throw new NotFoundError('Compliance item not found');
      res.json({ success: true, data: item });
      return;
    }

    const result = await db.oneOrNone(`
      UPDATE compliance_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *
    `, [...values, id]);

    if (!result) {
      throw new NotFoundError('Compliance item not found');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getExpiringItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { days = 30, jurisdiction } = req.query;

    let whereClause = `WHERE expiration_date IS NOT NULL 
      AND expiration_date <= CURRENT_DATE + INTERVAL '${Number(days)} days'
      AND expiration_date >= CURRENT_DATE
      AND status != 'expired'`;
    
    const params: string[] = [];
    let paramIndex = 1;

    if (jurisdiction) {
      whereClause += ` AND jurisdiction = $${paramIndex++}`;
      params.push(jurisdiction as string);
    }

    const items = await db.manyOrNone(`
      SELECT ci.*, e.first_name, e.last_name, e.email
      FROM compliance_items ci
      JOIN employees e ON ci.employee_id = e.id
      ${whereClause}
      ORDER BY expiration_date ASC
    `, params);

    res.json({
      success: true,
      data: items,
      meta: {
        days_ahead: Number(days),
        total: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction } = req.query;

    let jurisdictionFilter = '';
    const params: string[] = [];
    
    if (jurisdiction) {
      jurisdictionFilter = 'WHERE jurisdiction = $1';
      params.push(jurisdiction as string);
    }

    const [statusCounts, typeCounts, jurisdictionCounts, expiringSoon] = await Promise.all([
      db.manyOrNone(`
        SELECT status, COUNT(*) as count 
        FROM compliance_items ${jurisdictionFilter}
        GROUP BY status
      `, params),
      db.manyOrNone(`
        SELECT item_type, COUNT(*) as count 
        FROM compliance_items ${jurisdictionFilter}
        GROUP BY item_type
      `, params),
      db.manyOrNone(`
        SELECT jurisdiction, COUNT(*) as count 
        FROM compliance_items
        GROUP BY jurisdiction
      `),
      db.manyOrNone(`
        SELECT ci.*, e.first_name, e.last_name
        FROM compliance_items ci
        JOIN employees e ON ci.employee_id = e.id
        WHERE expiration_date IS NOT NULL 
          AND expiration_date <= CURRENT_DATE + INTERVAL '30 days'
          AND expiration_date >= CURRENT_DATE
        ${jurisdiction ? 'AND ci.jurisdiction = $1' : ''}
        ORDER BY expiration_date ASC
        LIMIT 10
      `, params),
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach(s => { byStatus[s.status] = parseInt(s.count, 10); });

    const byType: Record<string, number> = {};
    typeCounts.forEach(t => { byType[t.item_type] = parseInt(t.count, 10); });

    const byJurisdiction: Record<string, number> = {};
    jurisdictionCounts.forEach(j => { byJurisdiction[j.jurisdiction] = parseInt(j.count, 10); });

    res.json({
      success: true,
      data: {
        total_items: Object.values(byStatus).reduce((a, b) => a + b, 0),
        by_status: byStatus,
        by_type: byType,
        by_jurisdiction: byJurisdiction,
        expiring_soon: expiringSoon,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction, period_start, period_end } = req.body;
    const { OpenAIService } = await import('../services/ai/OpenAIService.js');
    
    // Gather compliance data
    const [statusCounts, typeCounts] = await Promise.all([
      db.manyOrNone(`
        SELECT status, COUNT(*) as count FROM compliance_items
        ${jurisdiction ? 'WHERE jurisdiction = $1' : ''}
        GROUP BY status
      `, jurisdiction ? [jurisdiction] : []),
      db.manyOrNone(`
        SELECT item_type, COUNT(*) as count FROM compliance_items
        ${jurisdiction ? 'WHERE jurisdiction = $1' : ''}
        GROUP BY item_type
      `, jurisdiction ? [jurisdiction] : []),
    ]);

    const byStatus: Record<string, number> = {};
    statusCounts.forEach(s => { byStatus[s.status] = parseInt(s.count, 10); });

    const byType: Record<string, number> = {};
    typeCounts.forEach(t => { byType[t.item_type] = parseInt(t.count, 10); });

    const aiService = new OpenAIService();
    const report = await aiService.generateComplianceReport({
      totalItems: Object.values(byStatus).reduce((a, b) => a + b, 0),
      expiringSoon: byStatus['expiring_soon'] || 0,
      expired: byStatus['expired'] || 0,
      byType,
      byJurisdiction: jurisdiction ? { [jurisdiction]: Object.values(byStatus).reduce((a, b) => a + b, 0) } : {},
    });

    // Save report
    const reportId = uuidv4();
    await db.none(`
      INSERT INTO compliance_reports (id, report_type, jurisdiction, period_start, period_end, generated_by, data)
      VALUES ($1, 'compliance_summary', $2, $3, $4, $5, $6)
    `, [reportId, jurisdiction, period_start || new Date(), period_end || new Date(), req.user?.userId, JSON.stringify({ content: report, byStatus, byType })]);

    res.json({
      success: true,
      data: {
        id: reportId,
        report,
        statistics: { byStatus, byType },
      },
    });
  } catch (error) {
    next(error);
  }
}
