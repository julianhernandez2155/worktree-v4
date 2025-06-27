'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Testing...');
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Success!');
      }
    } catch (err) {
      setMessage(`Caught error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Test Auth Page</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 bg-gray-800 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 bg-gray-800 rounded"
        />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded">
          Test Login
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}