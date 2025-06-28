import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Schema for task parsing
export const ParsedTaskSchema = z.object({
  title: z.string(),
  assignee_names: z.array(z.string()).optional(),
  due_date: z.string().optional(), // ISO date string
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  subtasks: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export type ParsedTask = z.infer<typeof ParsedTaskSchema>;

// Schema for subtask generation
export const GeneratedSubtasksSchema = z.object({
  subtasks: z.array(z.object({
    title: z.string(),
    estimated_hours: z.number().optional(),
  })),
});

export type GeneratedSubtasks = z.infer<typeof GeneratedSubtasksSchema>;

// Function definitions for OpenAI function calling
export const TASK_PARSER_FUNCTION = {
  name: 'parse_task',
  description: 'Extract task details from natural language input',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The main task title or description',
      },
      assignee_names: {
        type: 'array',
        items: { type: 'string' },
        description: 'Names of people to assign to the task',
      },
      due_date: {
        type: 'string',
        description: 'Due date in ISO format (YYYY-MM-DD)',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Task priority level',
      },
      subtasks: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of subtasks if mentioned',
      },
      description: {
        type: 'string',
        description: 'Additional details or context about the task',
      },
    },
    required: ['title'],
  },
};

export const SUBTASK_GENERATOR_FUNCTION = {
  name: 'generate_subtasks',
  description: 'Generate subtasks for a given task',
  parameters: {
    type: 'object',
    properties: {
      subtasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Subtask title',
            },
            estimated_hours: {
              type: 'number',
              description: 'Estimated hours to complete',
            },
          },
          required: ['title'],
        },
      },
    },
    required: ['subtasks'],
  },
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Error handling wrapper
export async function withOpenAIErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error in ${context}:`, {
        status: error.status,
        message: error.message,
        code: error.code,
      });
      
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    
    console.error(`Unexpected error in ${context}:`, error);
    throw error;
  }
}