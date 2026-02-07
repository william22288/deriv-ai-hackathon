import { db } from './dist/config/database.js';

async function checkUsers() {
  try {
    const users = await db.all('SELECT * FROM employees');
    console.log('Users in database:', users);
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();