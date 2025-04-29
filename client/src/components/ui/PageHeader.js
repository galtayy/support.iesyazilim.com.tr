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
    <div className={`pb-5 ${className}`}>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        
        {actions && <div className="mt-4 flex sm:mt-0 sm:ml-4">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;