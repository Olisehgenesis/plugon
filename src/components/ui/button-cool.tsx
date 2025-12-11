import React from 'react';

interface ButtonCoolProps {
  onClick?: () => void;
  text?: string;
  bgColor?: string;
  hoverBgColor?: string;
  borderColor?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}

export function ButtonCool({
  onClick,
  text,
  bgColor = '#2563eb',
  hoverBgColor,
  borderColor = '#050505',
  textColor = '#ffffff',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  children,
}: ButtonCoolProps) {
  const sizeClasses = {
    sm: 'px-[1em] py-[0.5em] text-[0.85em]',
    md: 'px-[1.5em] py-[0.7em] text-[0.95em]',
    lg: 'px-[2em] py-[1em] text-[1.1em]',
  };

  const defaultHoverBgColor = hoverBgColor || darkenColor(bgColor, 20);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative font-extrabold uppercase tracking-[0.05em] border-[0.2em] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] transition-all duration-[300ms] active:translate-x-[0.1em] active:translate-y-[0.1em] active:shadow-[0.2em_0.2em_0_#000000] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = defaultHoverBgColor;
          e.currentTarget.style.transform = 'translate(-0.1em, -0.1em)';
          e.currentTarget.style.boxShadow = '0.4em 0.4em 0 #000000';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = bgColor;
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = '0.3em 0.3em 0 #000000';
        }
      }}
    >
      {children || text}
    </button>
  );
}

// Helper to darken colors
function darkenColor(hex: string, amount: number): string {
  const color = hex.replace('#', '');
  const num = parseInt(color, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) - amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) - amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

