import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { input, memberNames, timezone } = await req.json();

    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }

    // Initialize OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key not configured');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create system prompt with member context and current date/time
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: timezone || 'UTC'
    });
    
    const systemPrompt = `You are a task parser for a project management system. Extract task details from natural language.

Current date: ${currentDate}
User timezone: ${timezone || 'UTC'}
Available team members: ${memberNames?.join(', ') || 'No members provided'}

Guidelines:
- Match names flexibly (e.g., "Sarah" matches "Sarah Johnson")
- For dates, return the natural language as-is (e.g., "next Friday", "tomorrow", "end of month")
- Time-based deadlines: "by midnight" = "today", "by noon" = "today", "by EOD" = "today"
- Infer priority from keywords: urgent/asap/midnight = urgent, important = high, whenever/eventually = low
- If multiple tasks are mentioned, focus on the main one
- Extract subtasks if they're clearly listed
- Be concise in task titles`;

    // Call OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      functions: [{
        name: 'parse_task',
        description: 'Extract task details from natural language input',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The main task title (concise and action-oriented)',
            },
            assignee_names: {
              type: 'array',
              items: { type: 'string' },
              description: 'Full names of people to assign (match to available members)',
            },
            due_date: {
              type: 'string',
              description: 'Due date in natural language (e.g., "tomorrow", "next Friday", "March 15")',
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
              description: 'Additional details or context',
            },
          },
          required: ['title'],
        },
      }],
      function_call: { name: 'parse_task' },
      temperature: 0.3, // Lower temperature for more consistent parsing
      max_tokens: 500,
    });

    // Extract the function call result
    const functionCall = completion.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to parse task');
    }

    const parsedTask = JSON.parse(functionCall.arguments);

    // Don't parse dates in the Edge Function - let the frontend handle it
    // This avoids timezone issues since the frontend has the correct timezone context

    // Match assignee names to actual members if provided
    let matchedAssignees = [];
    if (parsedTask.assignee_names && memberNames) {
      matchedAssignees = parsedTask.assignee_names.map((name: string) => {
        const lowerName = name.toLowerCase();
        const match = memberNames.find((member: string) => 
          member.toLowerCase().includes(lowerName) || 
          lowerName.includes(member.toLowerCase().split(' ')[0])
        );
        return {
          requestedName: name,
          matchedName: match || null,
          confidence: match ? 'high' : 'low',
        };
      });
    }

    // Return the parsed result
    return new Response(
      JSON.stringify({
        success: true,
        parsed: {
          ...parsedTask,
          assignee_matches: matchedAssignees,
        },
        original_input: input,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error parsing task:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to parse task',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

