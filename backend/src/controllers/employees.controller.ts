import { Response, NextFunction } from 'express';
import { EmployeeModel } from '../database/models/Employee.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

export async function getAllEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, jurisdiction, department, status } = req.query;
    
    const result = await EmployeeModel.findAll({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      jurisdiction: jurisdiction as 'MY' | 'SG' | 'UK' | 'US' | undefined,
      department: department as string | undefined,
      status: status as 'active' | 'inactive' | 'terminated' | 'on_leave' | undefined,
    });

    const totalPages = Math.ceil(result.total / (limit ? parseInt(limit as string, 10) : 20));

    res.json({
      success: true,
      data: result.employees.map(emp => ({
        id: emp.id,
        employee_id: emp.employee_id,
        email: emp.email,
        first_name: emp.first_name,
        last_name: emp.last_name,
        role: emp.role,
        department: emp.department,
        job_title: emp.job_title,
        hire_date: emp.hire_date,
        employment_status: emp.employment_status,
        location: emp.location,
        jurisdiction: emp.jurisdiction,
      })),
      meta: {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        total: result.total,
        total_pages: totalPages,
        has_next: (page ? parseInt(page as string, 10) : 1) < totalPages,
        has_prev: (page ? parseInt(page as string, 10) : 1) > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Check permission - users can view their own profile, managers/admins can view others
    if (req.user?.userId !== id && req.user?.role === 'employee') {
      throw new ForbiddenError('Cannot view other employee profiles');
    }

    res.json({
      success: true,
      data: {
        id: employee.id,
        employee_id: employee.employee_id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        department: employee.department,
        job_title: employee.job_title,
        hire_date: employee.hire_date,
        employment_status: employee.employment_status,
        location: employee.location,
        jurisdiction: employee.jurisdiction,
        manager_id: employee.manager_id,
        profile_data: employee.profile_data,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const employee = await EmployeeModel.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: employee.id,
        employee_id: employee.employee_id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        department: employee.department,
        job_title: employee.job_title,
        jurisdiction: employee.jurisdiction,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const employee = await EmployeeModel.update(id, req.body);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    res.json({
      success: true,
      data: {
        id: employee.id,
        employee_id: employee.employee_id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        department: employee.department,
        job_title: employee.job_title,
        employment_status: employee.employment_status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    // Verify the employee exists
    const manager = await EmployeeModel.findById(id);
    if (!manager) {
      throw new NotFoundError('Employee not found');
    }

    const team = await EmployeeModel.getTeam(id);

    res.json({
      success: true,
      data: team.map(emp => ({
        id: emp.id,
        employee_id: emp.employee_id,
        email: emp.email,
        first_name: emp.first_name,
        last_name: emp.last_name,
        role: emp.role,
        department: emp.department,
        job_title: emp.job_title,
      })),
    });
  } catch (error) {
    next(error);
  }
}
