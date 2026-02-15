import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap z-50 pointer-events-none`}
        >
          {content}
          <div className={`absolute ${
            position === 'top' ? 'top-full border-t-4 border-t-gray-900' :
            position === 'bottom' ? 'bottom-full border-b-4 border-b-gray-900' :
            position === 'left' ? 'left-full border-l-4 border-l-gray-900' :
            'right-full border-r-4 border-r-gray-900'
          } border-l-4 border-r-4 border-transparent`}
          style={{
            width: 0,
            height: 0,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        /></div>
      )}
    </div>
  );
};

export default Tooltip;
