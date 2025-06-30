'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestRPC() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testRPC = async () => {
      const supabase = createClient();
      
      try {
        // Test if the RPC function exists
        const { data, error } = await supabase.rpc('get_projects_with_skills_and_status', {
          p_limit: 1
        });
        
        if (error) {
          setError(error);
          console.error('RPC Error:', error);
        } else {
          setResult(data);
          console.log('RPC Success:', data);
        }
      } catch (err) {
        setError(err);
        console.error('Catch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    testRPC();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">RPC Function Test</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-500/20 p-4 rounded">
          <h2 className="font-bold">Error:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {result && (
        <div className="bg-green-500/20 p-4 rounded">
          <h2 className="font-bold">Success! Found {result.length} projects</h2>
          <pre>{JSON.stringify(result[0], null, 2)}</pre>
        </div>
      )}
    </div>
  );
}