import { db } from '../../config/database.js';
import { LabourLaw, LawCategory } from '../../types/policy.types.js';
import { Jurisdiction } from '../../types/employee.types.js';
import { v4 as uuidv4 } from 'uuid';

export class LabourLawModel {
  static async create(data: {
    jurisdiction: Jurisdiction;
    category: LawCategory;
    law_name: string;
    description: string;
    effective_date: string;
    source_url?: string;
    structured_data: Record<string, unknown>;
  }): Promise<LabourLaw> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO labour_laws (
        id, jurisdiction, category, law_name, description,
        effective_date, source_url, structured_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    return db.one<LabourLaw>(query, [
      id,
      data.jurisdiction,
      data.category,
      data.law_name,
      data.description,
      data.effective_date,
      data.source_url || null,
      JSON.stringify(data.structured_data),
    ]);
  }

  static async createMany(laws: Array<{
    jurisdiction: Jurisdiction;
    category: LawCategory;
    law_name: string;
    description: string;
    effective_date: string;
    source_url?: string;
    structured_data: Record<string, unknown>;
  }>): Promise<number> {
    if (laws.length === 0) return 0;

    const values = laws.map(law => ({
      id: uuidv4(),
      jurisdiction: law.jurisdiction,
      category: law.category,
      law_name: law.law_name,
      description: law.description,
      effective_date: law.effective_date,
      source_url: law.source_url || null,
      structured_data: JSON.stringify(law.structured_data),
    }));

    const cs = new db.$config.pgp.helpers.ColumnSet([
      'id', 'jurisdiction', 'category', 'law_name', 'description',
      'effective_date', 'source_url', 'structured_data:json'
    ], { table: 'labour_laws' });

    const query = db.$config.pgp.helpers.insert(values, cs);
    await db.none(query);
    
    return laws.length;
  }

  static async findById(id: string): Promise<LabourLaw | null> {
    return db.oneOrNone<LabourLaw>('SELECT * FROM labour_laws WHERE id = $1', [id]);
  }

  static async findAll(options: {
    jurisdiction?: Jurisdiction;
    category?: LawCategory;
  } = {}): Promise<LabourLaw[]> {
    let query = 'SELECT * FROM labour_laws WHERE 1=1';
    const params: string[] = [];
    let paramIndex = 1;

    if (options.jurisdiction) {
      query += ` AND jurisdiction = $${paramIndex++}`;
      params.push(options.jurisdiction);
    }
    if (options.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(options.category);
    }

    query += ' ORDER BY jurisdiction, category, law_name';

    return db.manyOrNone<LabourLaw>(query, params);
  }

  static async findByJurisdiction(jurisdiction: Jurisdiction): Promise<LabourLaw[]> {
    return db.manyOrNone<LabourLaw>(
      'SELECT * FROM labour_laws WHERE jurisdiction = $1 ORDER BY category, law_name',
      [jurisdiction]
    );
  }

  static async findByJurisdictionAndCategory(
    jurisdiction: Jurisdiction,
    category: LawCategory
  ): Promise<LabourLaw[]> {
    return db.manyOrNone<LabourLaw>(
      'SELECT * FROM labour_laws WHERE jurisdiction = $1 AND category = $2 ORDER BY law_name',
      [jurisdiction, category]
    );
  }

  static async deleteByJurisdiction(jurisdiction: Jurisdiction): Promise<number> {
    const result = await db.result(
      'DELETE FROM labour_laws WHERE jurisdiction = $1',
      [jurisdiction]
    );
    return result.rowCount;
  }

  static async deleteAll(): Promise<number> {
    const result = await db.result('DELETE FROM labour_laws');
    return result.rowCount;
  }

  static async count(): Promise<number> {
    const result = await db.one<{ count: string }>('SELECT COUNT(*) as count FROM labour_laws');
    return parseInt(result.count, 10);
  }
}

export default LabourLawModel;
