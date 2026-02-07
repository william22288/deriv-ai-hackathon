import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIService } from '../services/ai/OpenAIService.js';
import { EmployeeModel } from '../database/models/Employee.js';

export async function getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction, type } = req.query;

    let whereClause = 'WHERE is_active = true';
    const params: string[] = [];
    let paramIndex = 1;

    if (jurisdiction) {
      whereClause += ` AND jurisdiction = $${paramIndex++}`;
      params.push(jurisdiction as string);
    }
    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type as string);
    }

    const templates = await db.manyOrNone(`
      SELECT id, name, type, jurisdiction, language, version, metadata, created_at
      FROM contract_templates
      ${whereClause}
      ORDER BY jurisdiction, type, name
    `, params);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const template = await db.oneOrNone(`SELECT * FROM contract_templates WHERE id = $1`, [id]);

    if (!template) {
      throw new NotFoundError('Template not found');
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, type, jurisdiction, content, metadata } = req.body;
    const userId = req.user?.userId;
    const id = uuidv4();

    await db.none(`
      INSERT INTO contract_templates (id, name, type, jurisdiction, content, metadata, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [id, name, type, jurisdiction, content, JSON.stringify(metadata || {}), userId]);

    const template = await db.one(`SELECT * FROM contract_templates WHERE id = $1`, [id]);

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && ['name', 'content', 'metadata', 'is_active'].includes(key)) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
      }
    }

    // Increment version when content changes
    if (updates.content) {
      fields.push(`version = version + 1`);
    }

    if (fields.length === 0) {
      const template = await db.oneOrNone(`SELECT * FROM contract_templates WHERE id = $1`, [id]);
      if (!template) throw new NotFoundError('Template not found');
      res.json({ success: true, data: template });
      return;
    }

    const result = await db.oneOrNone(`
      UPDATE contract_templates SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *
    `, [...values, id]);

    if (!result) {
      throw new NotFoundError('Template not found');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employee_id, template_id, start_date, end_date, contract_data } = req.body;
    const userId = req.user?.userId;

    // Get template
    const template = await db.oneOrNone(`SELECT * FROM contract_templates WHERE id = $1`, [template_id]);
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    // Get employee
    const employee = await EmployeeModel.findById(employee_id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Merge employee data with contract data
    const mergedData = {
      employee_name: `${employee.first_name} ${employee.last_name}`,
      employee_email: employee.email,
      job_title: employee.job_title,
      department: employee.department,
      salary: employee.salary,
      salary_currency: employee.salary_currency,
      jurisdiction: employee.jurisdiction,
      start_date,
      ...contract_data,
    };

    // Use AI to generate the contract content
    const aiService = new OpenAIService();
    const generatedContent = await aiService.generateContractContent(
      template.content,
      mergedData,
      employee.jurisdiction
    );

    // Create contract record
    const contractId = uuidv4();
    await db.none(`
      INSERT INTO contracts (
        id, employee_id, template_id, type, jurisdiction, status,
        start_date, end_date, contract_data, generated_content, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9, $10)
    `, [
      contractId,
      employee_id,
      template_id,
      template.type,
      employee.jurisdiction,
      start_date,
      end_date || null,
      JSON.stringify(mergedData),
      generatedContent,
      userId,
    ]);

    // Create initial version
    await db.none(`
      INSERT INTO contract_versions (id, contract_id, version_number, changes_summary, content_snapshot, created_by)
      VALUES ($1, $2, 1, 'Initial draft', $3, $4)
    `, [uuidv4(), contractId, generatedContent, userId]);

    const contract = await db.one(`SELECT * FROM contracts WHERE id = $1`, [contractId]);

    res.status(201).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    next(error);
  }
}

export async function getContracts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { employee_id, status, type, page = 1, limit = 20 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (userRole === 'employee') {
      whereClause += ` AND c.employee_id = $${paramIndex++}`;
      params.push(userId!);
    } else if (employee_id) {
      whereClause += ` AND c.employee_id = $${paramIndex++}`;
      params.push(employee_id as string);
    }

    if (status) {
      whereClause += ` AND c.status = $${paramIndex++}`;
      params.push(status as string);
    }
    if (type) {
      whereClause += ` AND c.type = $${paramIndex++}`;
      params.push(type as string);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const contracts = await db.manyOrNone(`
      SELECT c.id, c.type, c.jurisdiction, c.version, c.status, c.start_date, c.end_date, 
             c.signed_at, c.created_at, e.first_name, e.last_name, t.name as template_name
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      LEFT JOIN contract_templates t ON c.template_id = t.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `, [...params, Number(limit), offset]);

    res.json({
      success: true,
      data: contracts,
    });
  } catch (error) {
    next(error);
  }
}

export async function getContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const contract = await db.oneOrNone(`
      SELECT c.*, e.first_name, e.last_name, e.email, t.name as template_name
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      LEFT JOIN contract_templates t ON c.template_id = t.id
      WHERE c.id = $1
    `, [id]);

    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    res.json({
      success: true,
      data: contract,
    });
  } catch (error) {
    next(error);
  }
}

export async function getContractVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const versions = await db.manyOrNone(`
      SELECT cv.*, e.first_name, e.last_name
      FROM contract_versions cv
      LEFT JOIN employees e ON cv.created_by = e.id
      WHERE cv.contract_id = $1
      ORDER BY cv.version_number DESC
    `, [id]);

    res.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const contract = await db.oneOrNone(`SELECT * FROM contracts WHERE id = $1`, [id]);

    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    // For now, return the generated content as text
    // In production, this would generate a PDF
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="contract-${id}.txt"`);
    res.send(contract.generated_content);
  } catch (error) {
    next(error);
  }
}

export async function signContract(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const result = await db.oneOrNone(`
      UPDATE contracts 
      SET status = 'active', signed_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('draft', 'pending_review')
      RETURNING *
    `, [id]);

    if (!result) {
      throw new NotFoundError('Contract not found or cannot be signed');
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateEquityDocs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employee_id, grant_type, total_units, strike_price, vesting_schedule_id, grant_date } = req.body;

    // Get employee
    const employee = await EmployeeModel.findById(employee_id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Get vesting schedule
    const vestingSchedule = vesting_schedule_id 
      ? await db.oneOrNone(`SELECT * FROM vesting_schedules WHERE id = $1`, [vesting_schedule_id])
      : null;

    // Create equity grant
    const grantId = uuidv4();
    await db.none(`
      INSERT INTO equity_grants (
        id, employee_id, grant_date, grant_type, total_units, 
        strike_price, vesting_schedule_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
    `, [grantId, employee_id, grant_date, grant_type, total_units, strike_price, vesting_schedule_id]);

    const grant = await db.one(`SELECT * FROM equity_grants WHERE id = $1`, [grantId]);

    res.status(201).json({
      success: true,
      data: {
        grant,
        vesting_schedule: vestingSchedule,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeEquity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employeeId } = req.params;

    const grants = await db.manyOrNone(`
      SELECT eg.*, vs.name as vesting_schedule_name, vs.schedule_details
      FROM equity_grants eg
      LEFT JOIN vesting_schedules vs ON eg.vesting_schedule_id = vs.id
      WHERE eg.employee_id = $1
      ORDER BY eg.grant_date DESC
    `, [employeeId]);

    res.json({
      success: true,
      data: grants,
    });
  } catch (error) {
    next(error);
  }
}
