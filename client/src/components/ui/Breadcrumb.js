import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex mb-5" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              {item.to ? (
                <Link
                  to={item.to}
                  className="ml-1 text-sm font-medium text-gray-600 hover:text-primary md:ml-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;