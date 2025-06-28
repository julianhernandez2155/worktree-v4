import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Function called!', req.method);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();
    console.log('Received input:', input);
    
    // Check API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('API Key exists:', !!apiKey, 'Length:', apiKey?.length);
    
    // For now, just return a mock response to test
    return new Response(
      JSON.stringify({
        success: true,
        parsed: {
          title: input || 'Test task',
          priority: 'medium',
          assignee_names: ['Test User'],
          due_date: 'tomorrow',
          due_date_parsed: {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            confidence: 'high'
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});