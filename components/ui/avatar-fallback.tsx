import React from 'react';

interface AvatarFallbackProps {
  name?: string | null;
  className?: string;
  size?: number;
}

export function AvatarFallback({ name, className = '', size = 128 }: AvatarFallbackProps) {
  const initials = name
    ? name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-yellow-500 to-orange-600',
  ];

  // Generate consistent color based on name
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const gradientColor = colors[colorIndex];

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br ${gradientColor} ${className}`}
      style={{ width: size, height: size }}
    >
      <span 
        className="text-white font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </span>
    </div>
  );
}