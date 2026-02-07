import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. AI features will not work.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const AI_CONFIG = {
  defaultModel: 'gpt-4-turbo-preview',
  embeddingModel: 'text-embedding-3-small',
  maxTokens: 4096,
  temperature: 0.7,
  maxRetries: 3,
  retryDelay: 1000,
};

export default openai;
