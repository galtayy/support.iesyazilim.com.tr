import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

const typeStyles = {
  success: {
    containerClass: 'bg-success/10 border-success/20',
    iconClass: 'text-success',
    icon: CheckCircleIcon
  },
  warning: {
    containerClass: 'bg-warning/10 border-warning/20',
    iconClass: 'text-warning',
    icon: ExclamationTriangleIcon
  },
  error: {
    containerClass: 'bg-danger/10 border-danger/20',
    iconClass: 'text-danger',
    icon: XCircleIcon
  },
  info: {
    containerClass: 'bg-primary/10 border-primary/20',
    iconClass: 'text-primary',
    icon: InformationCircleIcon
  }
};

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const { containerClass, iconClass, icon: Icon } = typeStyles[type] || typeStyles.info;

  return (
    <div className={`rounded-md border p-4 ${containerClass} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${iconClass}`}>{title}</h3>
          )}
          {message && (
            <div className="mt-1 text-sm text-gray-700">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${iconClass}`}
                onClick={onClose}
              >
                <span className="sr-only">Kapat</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;