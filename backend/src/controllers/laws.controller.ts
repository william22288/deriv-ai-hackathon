import { Response, NextFunction } from 'express';
import { LabourLawModel } from '../database/models/LabourLaw.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { Jurisdiction } from '../types/employee.types.js';
import { LawCategory } from '../types/policy.types.js';

const validJurisdictions: Jurisdiction[] = ['MY', 'SG', 'UK', 'US'];
const validCategories: LawCategory[] = ['leave', 'wages', 'contributions', 'working_hours', 'termination', 'benefits', 'compliance'];

export async function getAllLaws(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction, category } = req.query;
    
    const laws = await LabourLawModel.findAll({
      jurisdiction: jurisdiction as Jurisdiction | undefined,
      category: category as LawCategory | undefined,
    });

    res.json({
      success: true,
      data: laws,
      meta: {
        total: laws.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLawsByJurisdiction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction } = req.params;
    
    if (!validJurisdictions.includes(jurisdiction as Jurisdiction)) {
      throw new BadRequestError(`Invalid jurisdiction. Must be one of: ${validJurisdictions.join(', ')}`);
    }

    const laws = await LabourLawModel.findByJurisdiction(jurisdiction as Jurisdiction);

    // Group by category
    const groupedLaws = laws.reduce((acc, law) => {
      if (!acc[law.category]) {
        acc[law.category] = [];
      }
      acc[law.category].push(law);
      return acc;
    }, {} as Record<string, typeof laws>);

    res.json({
      success: true,
      data: {
        jurisdiction,
        categories: groupedLaws,
        total: laws.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLawsByCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jurisdiction, category } = req.params;
    
    if (!validJurisdictions.includes(jurisdiction as Jurisdiction)) {
      throw new BadRequestError(`Invalid jurisdiction. Must be one of: ${validJurisdictions.join(', ')}`);
    }

    if (!validCategories.includes(category as LawCategory)) {
      throw new BadRequestError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    const laws = await LabourLawModel.findByJurisdictionAndCategory(
      jurisdiction as Jurisdiction,
      category as LawCategory
    );

    res.json({
      success: true,
      data: {
        jurisdiction,
        category,
        laws,
        total: laws.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
