import dotenv from 'dotenv';
dotenv.config();

import { testConnection } from '../../config/database.js';
import { logger } from '../../middleware/logger.js';
import { seedLabourLaws } from './labourLaws.js';
import { seedPolicies } from './policies.js';
import { seedContractTemplates } from './templates.js';

async function runSeeds(): Promise<void> {
  logger.info('Starting database seeding...');
  
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Run all seeds
    await seedLabourLaws();
    await seedPolicies();
    await seedContractTemplates();

    logger.info('All seeds completed successfully!');
    
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
runSeeds()
  .then(() => {
    logger.info('Seed process complete');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seed process failed:', error);
    process.exit(1);
  });

export { runSeeds, seedLabourLaws, seedPolicies, seedContractTemplates };
