import React from 'react';

export const Select = ({ children, value, onValueChange }) => (
  <div className="relative">
    {children}
  </div>
);

export const SelectTrigger = ({
  children,
  className = '',
  ...props
}) => (
  <button
    type="button"
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

export const SelectValue = ({ placeholder }) => (
  <span className="text-gray-500">{placeholder}</span>
);

export const SelectContent = ({ children }) => (
  <div className="absolute top-full z-50 mt-1 max-h-60 min-w-[8rem] overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg">
    {children}
  </div>
);

export const SelectItem = ({
  children,
  value,
  onClick
}) => (
  <div
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
    onClick={() => onClick && onClick(value)}
  >
    {children}
  </div>
);