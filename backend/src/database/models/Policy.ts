import { db } from '../../config/database.js';
import { Policy, PolicyCategory, PolicyStatus, CreatePolicyDto } from '../../types/policy.types.js';
import { Jurisdiction } from '../../types/employee.types.js';
import { v4 as uuidv4 } from 'uuid';

export class PolicyModel {
  static async create(data: CreatePolicyDto & { created_by?: string }): Promise<Policy> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO policies (
        id, category, title, content, jurisdiction,
        effective_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    return db.one<Policy>(query, [
      id,
      data.category,
      data.title,
      data.content,
      data.jurisdiction || null,
      data.effective_date,
      data.created_by || null,
    ]);
  }

  static async createMany(policies: Array<CreatePolicyDto & { created_by?: string }>): Promise<number> {
    if (policies.length === 0) return 0;

    const values = policies.map(policy => ({
      id: uuidv4(),
      category: policy.category,
      title: policy.title,
      content: policy.content,
      jurisdiction: policy.jurisdiction || null,
      effective_date: policy.effective_date,
      created_by: policy.created_by || null,
      status: 'active',
      version: 1,
    }));

    const cs = new db.$config.pgp.helpers.ColumnSet([
      'id', 'category', 'title', 'content', 'jurisdiction',
      'effective_date', 'created_by', 'status', 'version'
    ], { table: 'policies' });

    const query = db.$config.pgp.helpers.insert(values, cs);
    await db.none(query);
    
    return policies.length;
  }

  static async findById(id: string): Promise<Policy | null> {
    return db.oneOrNone<Policy>('SELECT * FROM policies WHERE id = $1', [id]);
  }

  static async findAll(options: {
    page?: number;
    limit?: number;
    jurisdiction?: Jurisdiction;
    category?: PolicyCategory;
    status?: PolicyStatus;
  } = {}): Promise<{ policies: Policy[]; total: number }> {
    const { page = 1, limit = 20, jurisdiction, category, status = 'active' } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE status = $1';
    const params: (string | number)[] = [status];
    let paramIndex = 2;

    if (jurisdiction) {
      whereClause += ` AND (jurisdiction = $${paramIndex++} OR jurisdiction IS NULL)`;
      params.push(jurisdiction);
    }
    if (category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    const countQuery = `SELECT COUNT(*) as total FROM policies ${whereClause}`;
    const dataQuery = `
      SELECT * FROM policies ${whereClause}
      ORDER BY effective_date DESC, title
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const [countResult, policies] = await Promise.all([
      db.one<{ total: string }>(countQuery, params),
      db.manyOrNone<Policy>(dataQuery, [...params, limit, offset]),
    ]);

    return {
      policies,
      total: parseInt(countResult.total, 10),
    };
  }

  static async update(id: string, data: Partial<CreatePolicyDto>): Promise<Policy | null> {
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

    // Increment version
    updates.push(`version = version + 1`);

    const query = `
      UPDATE policies 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    return db.oneOrNone<Policy>(query, [...values, id]);
  }

  static async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    await db.none(
      'UPDATE policies SET embedding = $1 WHERE id = $2',
      [JSON.stringify(embedding), id]
    );
  }

  static async searchByEmbedding(
    embedding: number[],
    options: {
      jurisdiction?: Jurisdiction;
      category?: PolicyCategory;
      limit?: number;
    } = {}
  ): Promise<Array<Policy & { similarity: number }>> {
    const { jurisdiction, category, limit = 5 } = options;
    
    let whereClause = "WHERE status = 'active' AND embedding IS NOT NULL";
    const params: (string | number | string)[] = [JSON.stringify(embedding)];
    let paramIndex = 2;

    if (jurisdiction) {
      whereClause += ` AND (jurisdiction = $${paramIndex++} OR jurisdiction IS NULL)`;
      params.push(jurisdiction);
    }
    if (category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    const query = `
      SELECT *, 1 - (embedding <=> $1::vector) as similarity
      FROM policies
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT $${paramIndex}
    `;

    return db.manyOrNone<Policy & { similarity: number }>(query, [...params, limit]);
  }

  static async deleteAll(): Promise<number> {
    const result = await db.result('DELETE FROM policies');
    return result.rowCount;
  }

  static async count(): Promise<number> {
    const result = await db.one<{ count: string }>('SELECT COUNT(*) as count FROM policies');
    return parseInt(result.count, 10);
  }
}

export default PolicyModel;
