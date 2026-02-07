import { Request, Response, NextFunction } from 'express';
import { EmployeeModel } from '../database/models/Employee.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  AuthenticatedRequest 
} from '../middleware/auth.js';
import { UnauthorizedError, BadRequestError, ConflictError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, first_name, last_name, department, job_title, jurisdiction } = req.body;

    // Check if user already exists
    const existingUser = await EmployeeModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create employee
    const employee = await EmployeeModel.create({
      email,
      password,
      first_name,
      last_name,
      department,
      job_title,
      hire_date: new Date().toISOString().split('T')[0],
      location: 'Remote',
      jurisdiction,
      salary: 0,
      salary_currency: jurisdiction === 'MY' ? 'MYR' : jurisdiction === 'SG' ? 'SGD' : jurisdiction === 'UK' ? 'GBP' : 'USD',
    });

    // Generate tokens
    const tokenPayload = {
      userId: employee.id,
      email: employee.email,
      role: employee.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await db.none(`
      INSERT INTO refresh_tokens (id, employee_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `, [uuidv4(), employee.id, tokenHash, expiresAt]);

    res.status(201).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutes
        user: {
          id: employee.id,
          email: employee.email,
          first_name: employee.first_name,
          last_name: employee.last_name,
          role: employee.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user
    const employee = await EmployeeModel.findByEmail(email);
    if (!employee) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await EmployeeModel.verifyPassword(employee, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await EmployeeModel.updateLastLogin(employee.id);

    // Generate tokens
    const tokenPayload = {
      userId: employee.id,
      email: employee.email,
      role: employee.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await db.none(`
      INSERT INTO refresh_tokens (id, employee_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `, [uuidv4(), employee.id, tokenHash, expiresAt]);

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900,
        user: {
          id: employee.id,
          email: employee.email,
          first_name: employee.first_name,
          last_name: employee.last_name,
          role: employee.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refresh_token } = req.body;

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refresh_token);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token exists and is not revoked
    const storedTokens = await db.manyOrNone(`
      SELECT * FROM refresh_tokens 
      WHERE employee_id = ? AND revoked = 0 AND expires_at > datetime('now')
    `, [payload.userId]);

    let validToken = false;
    for (const token of storedTokens) {
      if (await bcrypt.compare(refresh_token, token.token_hash)) {
        validToken = true;
        // Revoke old token
        await db.none('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [token.id]);
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Generate new tokens
    const employee = await EmployeeModel.findById(payload.userId);
    if (!employee) {
      throw new UnauthorizedError('User not found');
    }

    const tokenPayload = {
      userId: employee.id,
      email: employee.email,
      role: employee.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Store new refresh token
    const tokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await db.none(`
      INSERT INTO refresh_tokens (id, employee_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `, [uuidv4(), employee.id, tokenHash, expiresAt]);

    res.json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 900,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Optionally revoke all refresh tokens for the user
      // For now, just return success
    }

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Not authenticated');
    }

    const token = authHeader.split(' ')[1];
    const jwt = await import('jsonwebtoken');
    const { AUTH_CONFIG } = await import('../config/auth.js');
    
    const decoded = jwt.default.verify(token, AUTH_CONFIG.jwtSecret) as { userId: string };
    
    const employee = await EmployeeModel.findById(decoded.userId);
    if (!employee) {
      throw new UnauthorizedError('User not found');
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
        location: employee.location,
        jurisdiction: employee.jurisdiction,
        employment_status: employee.employment_status,
      },
    });
  } catch (error) {
    next(error);
  }
}
