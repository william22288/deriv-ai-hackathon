import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIService } from '../services/ai/OpenAIService.js';
import { PolicyModel } from '../database/models/Policy.js';
import { EmployeeModel } from '../database/models/Employee.js';

export async function createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = uuidv4();

    await db.none(`
      INSERT INTO chat_sessions (id, employee_id, session_metadata, total_messages)
      VALUES ($1, $2, $3, 0)
    `, [id, userId, JSON.stringify({})]);

    const session = await db.one(`SELECT * FROM chat_sessions WHERE id = $1`, [id]);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const sessions = await db.manyOrNone(`
      SELECT * FROM chat_sessions 
      WHERE employee_id = $1 
      ORDER BY started_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, Number(limit), offset]);

    const countResult = await db.one<{ count: string }>(`
      SELECT COUNT(*) as count FROM chat_sessions WHERE employee_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: sessions,
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

export async function getSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const session = await db.oneOrNone(`
      SELECT * FROM chat_sessions WHERE id = $1 AND employee_id = $2
    `, [id, userId]);

    if (!session) {
      throw new NotFoundError('Chat session not found');
    }

    const messages = await db.manyOrNone(`
      SELECT * FROM chat_messages 
      WHERE session_id = $1 
      ORDER BY created_at ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...session,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    // Verify session exists and belongs to user
    const session = await db.oneOrNone(`
      SELECT * FROM chat_sessions WHERE id = $1 AND employee_id = $2
    `, [id, userId]);

    if (!session) {
      throw new NotFoundError('Chat session not found');
    }

    // Get employee info for context
    const employee = await EmployeeModel.findById(userId!);
    const jurisdiction = employee?.jurisdiction;

    // Save user message
    const userMessageId = uuidv4();
    await db.none(`
      INSERT INTO chat_messages (id, session_id, role, content, metadata)
      VALUES ($1, $2, 'user', $3, $4)
    `, [userMessageId, id, content, JSON.stringify({})]);

    // Initialize AI service
    const aiService = new OpenAIService();

    // Classify intent
    const intentResult = await aiService.classifyIntent(content);

    // Get conversation history
    const history = await db.manyOrNone(`
      SELECT role, content FROM chat_messages 
      WHERE session_id = $1 
      ORDER BY created_at ASC
      LIMIT 10
    `, [id]);

    let responseContent: string;
    let sources: Array<{ id: string; title: string }> = [];

    if (intentResult.intent === 'policy_question') {
      // Use RAG to answer policy questions
      const queryEmbedding = await aiService.generateEmbedding(content);
      const relevantPolicies = await PolicyModel.searchByEmbedding(queryEmbedding, {
        jurisdiction: jurisdiction,
        limit: 5,
      });

      const result = await aiService.generatePolicyAnswer(
        content,
        relevantPolicies.map(p => ({ id: p.id, title: p.title, content: p.content })),
        jurisdiction
      );

      responseContent = result.answer;
      sources = result.sources;
    } else if (intentResult.intent === 'greeting') {
      responseContent = `Hello! I'm your HR assistant. I can help you with:
- Questions about company policies (leave, expenses, benefits)
- Submitting requests (address updates, leave requests, expense claims)
- Checking your leave balance or request status
- General HR inquiries

How can I assist you today?`;
    } else if (intentResult.intent === 'request_submission') {
      const requestType = intentResult.entities.request_type as string || 'other';
      const extractedData = await aiService.extractRequestData(content, requestType);
      
      responseContent = `I understand you'd like to submit a ${requestType.replace('_', ' ')} request. I've extracted the following information:

${Object.entries(extractedData).map(([k, v]) => `- ${k.replace('_', ' ')}: ${v}`).join('\n')}

Would you like me to submit this request? Please confirm or provide any corrections.`;
    } else {
      // General response using conversation context
      responseContent = await aiService.generateChatCompletion(
        history.map(h => ({ role: h.role, content: h.content })),
        {
          systemPrompt: `You are a helpful HR assistant for a company with employees in Malaysia, Singapore, UK, and US. 
The current user is based in ${jurisdiction || 'an unknown location'}.
Be helpful, professional, and concise. If you don't know something, suggest contacting HR directly.`,
        }
      );
    }

    // Save assistant message
    const assistantMessageId = uuidv4();
    await db.none(`
      INSERT INTO chat_messages (id, session_id, role, content, intent, confidence_score, metadata)
      VALUES ($1, $2, 'assistant', $3, $4, $5, $6)
    `, [
      assistantMessageId,
      id,
      responseContent,
      intentResult.intent,
      intentResult.confidence,
      JSON.stringify({ sources, entities: intentResult.entities }),
    ]);

    // Update session message count
    await db.none(`
      UPDATE chat_sessions SET total_messages = total_messages + 2 WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        message: {
          id: assistantMessageId,
          role: 'assistant',
          content: responseContent,
          intent: intentResult.intent,
          confidence_score: intentResult.confidence,
        },
        sources,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await db.result(`
      DELETE FROM chat_sessions WHERE id = $1 AND employee_id = $2
    `, [id, userId]);

    if (result.rowCount === 0) {
      throw new NotFoundError('Chat session not found');
    }

    res.json({
      success: true,
      data: { message: 'Session deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
}
