import OpenAI from 'openai';
import { openai, AI_CONFIG } from '../../config/openai.js';
import { logger } from '../../middleware/logger.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface IntentClassificationResult {
  intent: 'policy_question' | 'request_submission' | 'status_check' | 'general_inquiry' | 'greeting' | 'unknown';
  confidence: number;
  entities: Record<string, unknown>;
}

export class OpenAIService {
  private client: OpenAI;
  private defaultModel: string;

  constructor() {
    this.client = openai;
    this.defaultModel = AI_CONFIG.defaultModel;
  }

  async generateChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      maxTokens = AI_CONFIG.maxTokens,
      temperature = AI_CONFIG.temperature,
      systemPrompt,
    } = options;

    const allMessages: ChatMessage[] = [];
    
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    
    allMessages.push(...messages);

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: allMessages,
        max_tokens: maxTokens,
        temperature,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('OpenAI chat completion failed:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: AI_CONFIG.embeddingModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('OpenAI embedding generation failed:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: AI_CONFIG.embeddingModel,
        input: texts,
      });

      return response.data.map(d => d.embedding);
    } catch (error) {
      logger.error('OpenAI batch embedding generation failed:', error);
      throw error;
    }
  }

  async classifyIntent(userMessage: string): Promise<IntentClassificationResult> {
    const systemPrompt = `You are an HR assistant intent classifier. Analyze the user's message and classify it into one of these intents:

1. policy_question - Questions about company policies, leave, benefits, expenses, etc.
2. request_submission - Requests to update information, submit leave, expenses, etc.
3. status_check - Checking status of a request, leave balance, etc.
4. general_inquiry - General questions about the company or HR matters
5. greeting - Greetings like hello, hi, good morning
6. unknown - Cannot determine intent

Also extract any relevant entities (dates, amounts, request types).

Respond in JSON format:
{
  "intent": "one of the above intents",
  "confidence": 0.0-1.0,
  "entities": { extracted entities }
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        intent: result.intent || 'unknown',
        confidence: result.confidence || 0,
        entities: result.entities || {},
      };
    } catch (error) {
      logger.error('Intent classification failed:', error);
      return { intent: 'unknown', confidence: 0, entities: {} };
    }
  }

  async generatePolicyAnswer(
    query: string,
    relevantPolicies: Array<{ title: string; content: string; id: string }>,
    jurisdiction?: string
  ): Promise<{ answer: string; sources: Array<{ id: string; title: string }> }> {
    const policyContext = relevantPolicies
      .map((p, i) => `[Policy ${i + 1}: ${p.title}]\n${p.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are a helpful HR assistant. Answer the user's question based on the provided company policies.

Guidelines:
- Be accurate and cite specific policies when answering
- If the answer isn't in the policies, say so and suggest contacting HR
- Be concise but complete
- For jurisdiction-specific questions, focus on ${jurisdiction || 'the relevant'} policies
- Always be professional and helpful

Available Policies:
${policyContext}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.5,
      });

      const answer = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please contact HR directly.';
      
      return {
        answer,
        sources: relevantPolicies.map(p => ({ id: p.id, title: p.title })),
      };
    } catch (error) {
      logger.error('Policy answer generation failed:', error);
      throw error;
    }
  }

  async generateContractContent(
    template: string,
    data: Record<string, unknown>,
    jurisdiction: string
  ): Promise<string> {
    const systemPrompt = `You are a legal document assistant. Fill in the contract template with the provided data.

Guidelines:
- Replace all {{placeholder}} tokens with appropriate values from the data
- For missing data, use reasonable defaults or mark as [TO BE COMPLETED]
- Ensure the contract complies with ${jurisdiction} labor laws
- Maintain professional legal language
- Do not add clauses not in the original template

Data provided: ${JSON.stringify(data, null, 2)}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please fill in this contract template:\n\n${template}` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      return response.choices[0]?.message?.content || template;
    } catch (error) {
      logger.error('Contract generation failed:', error);
      throw error;
    }
  }

  async generateComplianceReport(
    data: {
      totalItems: number;
      expiringSoon: number;
      expired: number;
      byType: Record<string, number>;
      byJurisdiction: Record<string, number>;
    }
  ): Promise<string> {
    const systemPrompt = `You are a compliance analyst. Generate an executive summary report based on the compliance data provided.

Include:
1. Overall compliance status
2. Key risks and areas of concern
3. Specific action items with priorities
4. Recommendations for improvement

Keep it concise but actionable.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a compliance report based on this data:\n${JSON.stringify(data, null, 2)}` },
        ],
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || 'Unable to generate report';
    } catch (error) {
      logger.error('Compliance report generation failed:', error);
      throw error;
    }
  }

  async extractRequestData(
    userMessage: string,
    requestType: string
  ): Promise<Record<string, unknown>> {
    const systemPrompt = `You are an HR assistant that extracts structured data from natural language requests.

For a ${requestType} request, extract all relevant information from the user's message.

Return a JSON object with the extracted data. Common fields might include:
- new_address (for address updates)
- dependent_name, relationship, date_of_birth (for dependent changes)
- start_date, end_date, leave_type (for leave requests)
- amount, category, description, receipt_date (for expense claims)

Only include fields that are mentioned or can be inferred from the message.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      logger.error('Request data extraction failed:', error);
      return {};
    }
  }
}

export default OpenAIService;
