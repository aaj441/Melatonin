import { ReactNode } from 'react';

interface GlowingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
}

export function GlowingButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  type = 'button',
  className = ''
}: GlowingButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth-out disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white hover:shadow-glow-soft hover:scale-[1.02] active:scale-[0.98] hover:from-cosmic-violet hover:to-cosmic-indigo',
    secondary: 'bg-cosmic-purple/20 border border-cosmic-purple text-ethereal-purple hover:bg-cosmic-purple/30 hover:border-cosmic-indigo hover:shadow-glow-soft hover:scale-[1.02] active:scale-[0.98]',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
        <span 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"
          style={{ 
            backgroundSize: '200% 100%',
          }}
        />
      </span>
      <span className="relative z-10">{children}</span>
    </button>
  );
}
