'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Checking connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();
        
        // Test basic connection
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .limit(5);
        
        if (error) {
          setError(error.message);
          setStatus('Connection failed');
        } else {
          setStatus(`Connected! Found ${data?.length || 0} skills in database.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Connection failed');
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
        
        <div className={`p-4 rounded-lg ${error ? 'bg-red-900/20 border border-red-500' : 'bg-green-900/20 border border-green-500'}`}>
          <p className="text-lg">{status}</p>
          {error && (
            <p className="text-red-400 mt-2">Error: {error}</p>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-dark-surface rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Connection Details:</h2>
          <p className="text-gray-400">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p className="text-gray-400">Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...</p>
        </div>
      </div>
    </div>
  );
}