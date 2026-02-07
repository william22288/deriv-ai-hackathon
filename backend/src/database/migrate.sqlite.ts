import fs from 'fs';
import path from 'path';
import { db } from '../config/database.sqlite.js';
import { logger } from '../middleware/logger.js';

async function runMigrations(): Promise<void> {
  // Use process.cwd() based path for migrations
  const migrationsDir = path.join(process.cwd(), 'src', 'database', 'migrations');
  
  try {
    // Get all SQLite SQL files in migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sqlite.sql'))
      .sort();

    logger.info(`Found ${files.length} migration file(s)`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      logger.info(`Running migration: ${file}`);
      
      // Execute the entire SQL file at once (SQLite supports this)
      db.exec(sql);
      
      logger.info(`Completed migration: ${file}`);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

// Run if called directly
runMigrations()
  .then(() => {
    logger.info('Migration process complete');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration process failed:', error);
    process.exit(1);
  });

export { runMigrations };
