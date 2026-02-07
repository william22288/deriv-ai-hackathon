import { db } from '../../config/database.js';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto, EmploymentStatus, Jurisdiction } from '../../types/employee.types.js';
import { Role } from '../../config/auth.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { AUTH_CONFIG } from '../../config/auth.js';

export class EmployeeModel {
  static async create(data: CreateEmployeeDto): Promise<Employee> {
    const id = uuidv4();
    const employeeId = `EMP${Date.now().toString(36).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(data.password, AUTH_CONFIG.saltRounds);
    
    const query = `
      INSERT INTO employees (
        id, employee_id, email, password_hash, first_name, last_name,
        role, department, job_title, hire_date, location, jurisdiction,
        salary, salary_currency, manager_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `;
    
    return db.one<Employee>(query, [
      id,
      employeeId,
      data.email.toLowerCase(),
      passwordHash,
      data.first_name,
      data.last_name,
      data.role || 'employee',
      data.department,
      data.job_title,
      data.hire_date,
      data.location,
      data.jurisdiction,
      data.salary,
      data.salary_currency,
      data.manager_id || null,
    ]);
  }

  static async findById(id: string): Promise<Employee | null> {
    return db.oneOrNone<Employee>('SELECT * FROM employees WHERE id = $1', [id]);
  }

  static async findByEmail(email: string): Promise<Employee | null> {
    return db.oneOrNone<Employee>(
      'SELECT * FROM employees WHERE email = $1',
      [email.toLowerCase()]
    );
  }

  static async findByEmployeeId(employeeId: string): Promise<Employee | null> {
    return db.oneOrNone<Employee>(
      'SELECT * FROM employees WHERE employee_id = $1',
      [employeeId]
    );
  }

  static async findAll(options: {
    page?: number;
    limit?: number;
    jurisdiction?: Jurisdiction;
    department?: string;
    status?: EmploymentStatus;
  } = {}): Promise<{ employees: Employee[]; total: number }> {
    const { page = 1, limit = 20, jurisdiction, department, status } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (jurisdiction) {
      whereClause += ` AND jurisdiction = $${paramIndex++}`;
      params.push(jurisdiction);
    }
    if (department) {
      whereClause += ` AND department = $${paramIndex++}`;
      params.push(department);
    }
    if (status) {
      whereClause += ` AND employment_status = $${paramIndex++}`;
      params.push(status);
    }

    const countQuery = `SELECT COUNT(*) as total FROM employees ${whereClause}`;
    const dataQuery = `
      SELECT * FROM employees ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const [countResult, employees] = await Promise.all([
      db.one<{ total: string }>(countQuery, params),
      db.manyOrNone<Employee>(dataQuery, [...params, limit, offset]),
    ]);

    return {
      employees,
      total: parseInt(countResult.total, 10),
    };
  }

  static async update(id: string, data: UpdateEmployeeDto): Promise<Employee | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (updates.length === 0) return this.findById(id);

    const query = `
      UPDATE employees 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    return db.oneOrNone<Employee>(query, [...values, id]);
  }

  static async updateLastLogin(id: string): Promise<void> {
    await db.none(
      'UPDATE employees SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  static async verifyPassword(employee: Employee, password: string): Promise<boolean> {
    return bcrypt.compare(password, employee.password_hash);
  }

  static async getTeam(managerId: string): Promise<Employee[]> {
    return db.manyOrNone<Employee>(
      'SELECT * FROM employees WHERE manager_id = $1 ORDER BY first_name, last_name',
      [managerId]
    );
  }

  static async countByJurisdiction(): Promise<Record<Jurisdiction, number>> {
    const results = await db.manyOrNone<{ jurisdiction: Jurisdiction; count: string }>(
      `SELECT jurisdiction, COUNT(*) as count FROM employees 
       WHERE employment_status = 'active' 
       GROUP BY jurisdiction`
    );
    
    const counts: Record<string, number> = { MY: 0, SG: 0, UK: 0, US: 0 };
    results.forEach(r => {
      counts[r.jurisdiction] = parseInt(r.count, 10);
    });
    return counts as Record<Jurisdiction, number>;
  }
}

export default EmployeeModel;
