import React from 'react';

const Card = ({ 
  children, 
  title, 
  description, 
  footer,
  className = '', 
  bodyClassName = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>{children}</div>
      
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;