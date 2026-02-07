import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getPrograms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { is_mandatory, category } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: (string | boolean)[] = [];
    let paramIndex = 1;

    if (is_mandatory !== undefined) {
      whereClause += ` AND is_mandatory = $${paramIndex++}`;
      params.push(is_mandatory === 'true');
    }
    if (category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(category as string);
    }

    const programs = await db.manyOrNone(`
      SELECT * FROM training_programs
      ${whereClause}
      ORDER BY name
    `, params);

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const program = await db.oneOrNone(`SELECT * FROM training_programs WHERE id = $1`, [id]);

    if (!program) {
      throw new NotFoundError('Training program not found');
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, category, is_mandatory, target_roles, frequency, duration_hours, provider } = req.body;
    const id = uuidv4();

    await db.none(`
      INSERT INTO training_programs (id, name, description, category, is_mandatory, target_roles, frequency, duration_hours, provider)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, name, description, category, is_mandatory || false, JSON.stringify(target_roles || []), frequency || 'once', duration_hours, provider]);

    const program = await db.one(`SELECT * FROM training_programs WHERE id = $1`, [id]);

    res.status(201).json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(key === 'target_roles' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) {
      const program = await db.oneOrNone(`SELECT * FROM training_programs WHERE id = $1`, [id]);
      if (!program) throw new NotFoundError('Training program not found');
      res.json({ success: true, data: program });
      return;
    }

    const result = await db.oneOrNone(`
      UPDATE training_programs SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *
    `, [...values, id]);

    if (!result) {
      throw new NotFoundError('Training program not found');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { employee_id, status, page = 1, limit = 20 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (userRole === 'employee') {
      whereClause += ` AND et.employee_id = $${paramIndex++}`;
      params.push(userId!);
    } else if (employee_id) {
      whereClause += ` AND et.employee_id = $${paramIndex++}`;
      params.push(employee_id as string);
    }

    if (status) {
      whereClause += ` AND et.status = $${paramIndex++}`;
      params.push(status as string);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const assignments = await db.manyOrNone(`
      SELECT et.*, tp.name as program_name, tp.description, tp.is_mandatory, tp.duration_hours,
             e.first_name, e.last_name
      FROM employee_training et
      JOIN training_programs tp ON et.training_program_id = tp.id
      JOIN employees e ON et.employee_id = e.id
      ${whereClause}
      ORDER BY et.due_date ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, Number(limit), offset]);

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employee_id, training_program_id, due_date } = req.body;
    const id = uuidv4();

    await db.none(`
      INSERT INTO employee_training (id, employee_id, training_program_id, due_date, status)
      VALUES ($1, $2, $3, $4, 'not_started')
    `, [id, employee_id, training_program_id, due_date]);

    const assignment = await db.one(`
      SELECT et.*, tp.name as program_name
      FROM employee_training et
      JOIN training_programs tp ON et.training_program_id = tp.id
      WHERE et.id = $1
    `, [id]);

    // Create notification
    await db.none(`
      INSERT INTO notifications (id, employee_id, type, title, message, priority)
      VALUES ($1, $2, 'training_assigned', 'New Training Assigned', $3, 'normal')
    `, [uuidv4(), employee_id, `You have been assigned the "${assignment.program_name}" training. Due date: ${due_date}`]);

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { score, certificate_path } = req.body;
    const userId = req.user?.userId;

    // Verify ownership if employee
    if (req.user?.role === 'employee') {
      const assignment = await db.oneOrNone(`SELECT * FROM employee_training WHERE id = $1 AND employee_id = $2`, [id, userId]);
      if (!assignment) {
        throw new NotFoundError('Training assignment not found');
      }
    }

    const result = await db.oneOrNone(`
      UPDATE employee_training 
      SET status = 'completed', 
          completed_date = CURRENT_DATE,
          score = $1,
          certificate_path = $2
      WHERE id = $3 
      RETURNING *
    `, [score, certificate_path, id]);

    if (!result) {
      throw new NotFoundError('Training assignment not found');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOverdueTraining(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction } = req.query;

    let whereClause = `WHERE et.status IN ('not_started', 'in_progress') 
                       AND et.due_date < CURRENT_DATE`;
    const params: string[] = [];
    
    if (jurisdiction) {
      whereClause += ` AND e.jurisdiction = $1`;
      params.push(jurisdiction as string);
    }

    const overdueTraining = await db.manyOrNone(`
      SELECT et.*, tp.name as program_name, tp.is_mandatory,
             e.first_name, e.last_name, e.email, e.jurisdiction
      FROM employee_training et
      JOIN training_programs tp ON et.training_program_id = tp.id
      JOIN employees e ON et.employee_id = e.id
      ${whereClause}
      ORDER BY et.due_date ASC
    `, params);

    // Update status to overdue
    await db.none(`
      UPDATE employee_training 
      SET status = 'overdue'
      WHERE status IN ('not_started', 'in_progress') 
        AND due_date < CURRENT_DATE
    `);

    res.json({
      success: true,
      data: overdueTraining,
      meta: {
        total: overdueTraining.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
