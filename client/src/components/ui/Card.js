import React from 'react';

const Card = ({ 
  children, 
  title, 
  description, 
  footer,
  className = '', 
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  noPadding = false,
  elevation = 'md', // 'none', 'sm', 'md', 'lg', 'xl'
  border = false
}) => {
  // Shadow classes based on elevation
  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl'
  };

  // Build combined className
  const cardClassName = `
    card 
    ${border ? 'border border-gray-200' : ''} 
    ${shadowClasses[elevation] || shadowClasses.md}
    ${className}
  `;

  return (
    <div className={cardClassName}>
      {(title || description) && (
        <div className={`border-b border-gray-200 px-5 py-4 sm:px-6 ${headerClassName}`}>
          {title && <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}
      
      <div className={`${noPadding ? '' : 'px-5 py-5 sm:p-6'} ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 px-5 py-4 sm:px-6 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;