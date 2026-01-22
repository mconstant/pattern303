import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  className?: string;
}

export function Tooltip({ children, text, className = '' }: TooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        className={`cursor-help border-b border-dotted border-amber-400 ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 w-64 p-3 text-sm text-gray-100 bg-gray-900 border border-amber-600 rounded-lg shadow-lg -left-32 top-full mt-2">
          {text}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-amber-600 rotate-45" />
        </div>
      )}
    </div>
  );
}
