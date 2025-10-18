import { ReactNode } from 'react';

interface MysticalCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function MysticalCard({ children, className = '', glow = false, onClick }: MysticalCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        glass
        border border-cosmic-purple/30
        rounded-2xl p-6
        transition-all duration-300 ease-smooth-out
        ${glow ? 'shadow-glow hover:shadow-glow-lg' : 'hover:border-cosmic-indigo/50 hover:shadow-cosmic'}
        ${onClick ? 'cursor-pointer hover-lift' : ''}
        hover:bg-cosmic-darker/90
        ${className}
      `}
    >
      {children}
    </div>
  );
}
