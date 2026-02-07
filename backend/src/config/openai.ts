import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. AI features will not work.');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const AI_CONFIG = {
  defaultModel: 'gemini-pro',
  embeddingModel: 'embedding-001',
  maxTokens: 4096,
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000,
};

export default genAI;
