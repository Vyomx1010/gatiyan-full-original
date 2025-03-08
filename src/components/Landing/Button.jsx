import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900',
    secondary: 'bg-white text-black hover:bg-gray-100',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10'
  };

  const sizes = {
    sm: 'px-2 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-2 text-lg'
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
