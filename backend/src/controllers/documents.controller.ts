import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from '../services/ai/GeminiService.js';
import { EmployeeModel } from '../database/models/Employee.js';
import fetch from 'node-fetch';

// Mock document generation function
function generateMockDocument(documentType: string, data: any): string {
  const now = new Date().toLocaleDateString();
  
  switch (documentType) {
    case 'employment':
      return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made and entered into as of ${now}, by and between [COMPANY NAME] ("Employer") and ${data.employeeName || '[EMPLOYEE NAME]'} ("Employee").

1. POSITION
Employee is employed as ${data.position || '[POSITION TITLE]'}.`;
    
    case 'nda':
      return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is made as of ${now}.

The parties agree to maintain confidentiality of proprietary information.`;
    
    case 'contractor':
      return `INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement is made as of ${now}.

The Contractor agrees to perform services for the Company as an independent contractor.`;
    
    default:
      return `DOCUMENT

Generated on: ${now}
Document Type: ${documentType}
Employee: ${data.employeeName || 'N/A'}
Jurisdiction: ${data.jurisdiction || 'N/A'}`;
  }
}

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
    const aiService = new GeminiService();
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

export async function generateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { documentType, data } = req.body;
    const userId = req.user?.userId;
    
    if (!documentType || !data) {
      throw new BadRequestError('Document type and data are required');
    }

    // Generate a mock document since the Supabase function doesn't exist
    const documentContent = generateMockDocument(documentType, data);
    
    // Save to database
    const documentId = uuidv4();
    const now = new Date().toISOString();
    
    await db.none(`
      INSERT INTO contracts (id, employee_id, type, jurisdiction, start_date, generated_content, status, contract_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `, [documentId, userId, documentType, data.jurisdiction || 'US', new Date().toISOString().split('T')[0], documentContent, JSON.stringify({ generatedBy: 'backend-mock' }), now]);

    const result = {
      document: {
        id: documentId,
        type: documentType,
        employeeName: data.employeeName,
        jurisdiction: data.jurisdiction,
        status: 'generated',
        content: documentContent,
        generatedAt: now
      }
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    
    // Get documents from database instead of calling Supabase
    const documents = await db.manyOrNone(`
      SELECT id, type, generated_content as content, status, created_at as generatedAt
      FROM contracts 
      WHERE employee_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);
    
    // If no documents found, return empty array
    const result = {
      documents: documents.map(doc => ({
        ...doc,
        employeeName: 'Mock Employee',
        jurisdiction: 'US-CA'
      }))
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplianceItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    
    // Return mock compliance data instead of calling Supabase
    const mockItems = [
      {
        id: '1',
        type: 'permit',
        title: 'H-1B Work Authorization',
        employee: 'John Doe',
        jurisdiction: 'US',
        status: 'expiring',
        dueDate: '2026-03-10',
        daysUntilDue: 31,
        priority: 'high'
      },
      {
        id: '2',
        type: 'training',
        title: 'Anti-Harassment Training',
        employee: 'Jane Smith',
        jurisdiction: 'US-CA',
        status: 'overdue',
        dueDate: '2026-02-01',
        daysUntilDue: -6,
        priority: 'critical'
      }
    ];
    
    const result = {
      items: mockItems
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function addComplianceItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { item } = req.body;
    const userId = req.user?.userId;
    
    if (!item) {
      throw new BadRequestError('Compliance item data is required');
    }

    // Return success response with mock data instead of calling Supabase
    const result = {
      item: {
        id: uuidv4(),
        ...item,
        createdAt: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplianceItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { updates } = req.body;
    const userId = req.user?.userId;
    
    if (!updates) {
      throw new BadRequestError('Update data is required');
    }

    // Proxy the request to Supabase function
    const supabaseUrl = `https://rfottcchwgrkzzritxvq.supabase.co/functions/v1/make-server-10623954/compliance/${id}`;
    
    const response = await fetch(supabaseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here'}`
      },
      body: JSON.stringify({
        updates,
        userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase function error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComplianceItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    // Proxy the request to Supabase function
    const supabaseUrl = `https://rfottcchwgrkzzritxvq.supabase.co/functions/v1/make-server-10623954/compliance/${id}`;
    
    const response = await fetch(supabaseUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here'}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase function error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplianceAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    
    // Proxy the request to Supabase function
    const supabaseUrl = 'https://rfottcchwgrkzzritxvq.supabase.co/functions/v1/make-server-10623954/compliance/analytics';
    
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here'}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase function error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
