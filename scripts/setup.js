#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Worktree v4 development environment...\n');

// Create necessary directories
const directories = [
  'app',
  'components/ui',
  'components/features',
  'lib/supabase',
  'lib/hooks',
  'lib/utils',
  'public',
  'styles',
  'types',
  'tests/unit',
  'tests/e2e',
  'tests/setup',
  '.vscode',
  '.husky'
];

console.log('📁 Creating project directories...');
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  ✓ Created ${dir}`);
  }
});

// Create essential files if they don't exist
console.log('\n📄 Creating essential files...');

// Create .vscode files if they don't exist
const vscodeSettingsPath = path.join(process.cwd(), '.vscode/settings.json');
if (!fs.existsSync(vscodeSettingsPath)) {
  fs.writeFileSync(vscodeSettingsPath, fs.readFileSync(path.join(__dirname, '../.vscode/settings.json')));
  console.log('  ✓ Created .vscode/settings.json');
}

// Create test setup file
const testSetupPath = path.join(process.cwd(), 'tests/setup/setup.ts');
if (!fs.existsSync(testSetupPath)) {
  fs.writeFileSync(testSetupPath, `// Test setup file
import '@testing-library/jest-dom';

// Add any global test setup here
`);
  console.log('  ✓ Created test setup file');
}

// Create app layout file
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (!fs.existsSync(layoutPath)) {
  fs.writeFileSync(layoutPath, `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Worktree v4',
  description: 'Bridge campus involvement with career readiness',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`);
  console.log('  ✓ Created app/layout.tsx');
}

// Create global styles
const globalsPath = path.join(process.cwd(), 'app/globals.css');
if (!fs.existsSync(globalsPath)) {
  fs.writeFileSync(globalsPath, `@tailwind base;
@tailwind components;
@tailwind utilities;
`);
  console.log('  ✓ Created app/globals.css');
}

// Create a simple home page
const pagePath = path.join(process.cwd(), 'app/page.tsx');
if (!fs.existsSync(pagePath)) {
  fs.writeFileSync(pagePath, `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Worktree v4</h1>
      <p className="mt-4 text-xl text-gray-600">
        Your development environment is ready!
      </p>
    </main>
  );
}
`);
  console.log('  ✓ Created app/page.tsx');
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('\n⚠️  No .env.local file found!');
  console.log('  Please copy .env.example to .env.local and fill in your values:');
  console.log('  cp .env.example .env.local');
}

console.log('\n🔧 Setting up git hooks...');
try {
  execSync('npx husky install', { stdio: 'inherit' });
  console.log('  ✓ Husky installed');
} catch (error) {
  console.log('  ⚠️  Could not install Husky hooks');
}

console.log('\n✅ Setup complete!');
console.log('\nNext steps:');
console.log('1. Copy .env.example to .env.local and add your Supabase credentials');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:3000 to see your app');
console.log('\nHappy coding! 🎉');