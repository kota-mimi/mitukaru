import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 rounded-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Primary: Dodger Blue background, White text, Blue Glow
    primary: "bg-primary hover:bg-white hover:text-primary text-white shadow-[0_0_15px_rgba(0,90,156,0.4)] hover:shadow-[0_0_25px_rgba(0,90,156,0.6)] border border-transparent",
    // Secondary: Dark Navy background
    secondary: "bg-secondary hover:bg-slate-700 text-white border border-secondary",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:text-secondary hover:bg-slate-100",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-8 py-3.5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};