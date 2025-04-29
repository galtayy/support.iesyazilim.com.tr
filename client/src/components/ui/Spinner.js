import React from 'react';

const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-[5px]'
  };

  // Color classes
  const colorClasses = {
    primary: 'border-primary',
    success: 'border-success',
    warning: 'border-warning',
    danger: 'border-danger',
    gray: 'border-gray-500',
    white: 'border-white'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.primary;

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent ${sizeClass} ${colorClass} ${className}`}
      role="status"
      aria-label="Yükleniyor"
    >
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
};

export default Spinner;