import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      padding = 'md',
      border = true,
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    const borderClass = border ? 'border border-gray-200' : '';
    const hoverClass = hoverable ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer transition-all duration-200' : '';

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-sm ${borderClass} ${hoverClass} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
