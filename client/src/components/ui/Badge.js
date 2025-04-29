import React from 'react';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const Badge = ({ status, label, customClass }) => {
  // If it's a status badge (pending, approved, rejected)
  if (status && statusStyles[status]) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
        {label || status}
      </span>
    );
  }
  
  // If it's a custom badge
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${customClass}`}>
      {label}
    </span>
  );
};

export default Badge;