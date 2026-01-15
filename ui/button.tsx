import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-mono uppercase tracking-widest text-xs py-3 px-6 transition-all duration-300 border focus:outline-none focus:ring-1 focus:ring-white";
  
  const variants = {
    primary: "bg-white text-black border-white hover:bg-black hover:text-white",
    secondary: "bg-black text-white border-neutral-800 hover:border-white",
    danger: "bg-black text-red-500 border-red-900 hover:bg-red-900 hover:text-black hover:border-red-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};