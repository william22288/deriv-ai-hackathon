import { Response, NextFunction } from 'express';
import { PolicyModel } from '../database/models/Policy.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { GeminiService } from '../services/ai/GeminiService.js';
import { PolicyCategory } from '../types/policy.types.js';
import { Jurisdiction } from '../types/employee.types.js';

export async function getPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, jurisdiction, category } = req.query;
    
    const result = await PolicyModel.findAll({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      jurisdiction: jurisdiction as Jurisdiction | undefined,
      category: category as PolicyCategory | undefined,
    });

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;
    const totalPages = Math.ceil(result.total / limitNum);

    res.json({
      success: true,
      data: result.policies,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const policy = await PolicyModel.findById(id);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    res.json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const policy = await PolicyModel.create({
      ...req.body,
      created_by: req.user?.userId,
    });

    // Generate embedding for the policy content
    try {
      const aiService = new GeminiService();
      const embedding = await aiService.generateEmbedding(policy.content);
      await PolicyModel.updateEmbedding(policy.id, embedding);
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError);
      // Continue without embedding - it can be generated later
    }

    res.status(201).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    const policy = await PolicyModel.update(id, req.body);
    if (!policy) {
      throw new NotFoundError('Policy not found');
    }

    // Regenerate embedding if content changed
    if (req.body.content) {
      try {
        const aiService = new GeminiService();
        const embedding = await aiService.generateEmbedding(policy.content);
        await PolicyModel.updateEmbedding(policy.id, embedding);
      } catch (embeddingError) {
        console.error('Failed to generate embedding:', embeddingError);
      }
    }

    res.json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { query, jurisdiction, category, limit } = req.body;
    
    // Generate embedding for the query
    const aiService = new OpenAIService();
    const queryEmbedding = await aiService.generateEmbedding(query);
    
    // Search for similar policies
    const results = await PolicyModel.searchByEmbedding(queryEmbedding, {
      jurisdiction: jurisdiction as Jurisdiction | undefined,
      category: category as PolicyCategory | undefined,
      limit: limit || 5,
    });

    res.json({
      success: true,
      data: results.map(r => ({
        ...r,
        similarity: Math.round(r.similarity * 100) / 100,
      })),
    });
  } catch (error) {
    next(error);
  }
}
