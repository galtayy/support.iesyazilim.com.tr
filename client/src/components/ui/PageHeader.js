import React from 'react';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({ 
  title, 
  description, 
  breadcrumbItems = [], 
  actions,
  className = ''
}) => {
  return (
    <div className={`pb-3 sm:pb-5 ${className}`}>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-3 flex justify-start sm:justify-end sm:mt-0 sm:ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;