import React from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

const EmptyState = ({
  title = 'Veri bulunamadı',
  description = 'Aradığınız kriterlere uygun kayıt bulunamadı.',
  icon: Icon = FolderIcon,
  actionText = 'Yeni Oluştur',
  actionLink,
  onActionClick,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto h-12 w-12 text-gray-400">
        <Icon className="h-full w-full" aria-hidden="true" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      
      {(actionLink || onActionClick) && (
        <div className="mt-6">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              {actionText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;