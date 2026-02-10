import React, { useState, useRef, useEffect } from 'react';

const ResizableSplitPane = ({ 
  left, 
  right, 
  defaultSize = 60, 
  minSize = 30, 
  maxSize = 80,
  onResize 
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const touch = e.touches?.[0];
      let newSize;

      if (isMobile) {
        const clientY = touch ? touch.clientY : e.clientY;
        newSize = ((clientY - container.top) / container.height) * 100;
      } else {
        const clientX = touch ? touch.clientX : e.clientX;
        newSize = ((clientX - container.left) / container.width) * 100;
      }

      if (newSize >= minSize && newSize <= maxSize) {
        setLeftWidth(newSize);
        onResize?.(newSize);
      }
    };

    const handleEnd = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    if (!isMobile) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minSize, maxSize, onResize, isMobile]);

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Mobile: Vertical split
  if (isMobile) {
    return (
      <div ref={containerRef} className="flex flex-col h-full w-full relative overflow-hidden">
        <div className="w-full overflow-hidden" style={{ height: `${leftWidth}%` }}>
          {left}
        </div>

        <div
          className={`relative flex items-center justify-center cursor-row-resize transition-all group z-30 ${
            isDragging ? 'h-3' : 'h-2 active:h-3'
          }`}
          onTouchStart={startDrag}
          onMouseDown={startDrag}
        >
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-gray-300/80 to-transparent ${
            isDragging ? 'opacity-100' : 'opacity-60'
          } transition-opacity`} />
          
          <div className={`absolute h-7 w-20 rounded-full bg-white/90 backdrop-blur-xl border-2 border-gray-300/60 shadow-xl flex items-center justify-center ${
            isDragging ? 'scale-110' : 'scale-100'
          } transition-transform`}>
            <div className="flex flex-col gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-0.5 w-8 bg-gray-400 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden" style={{ height: `${100 - leftWidth}%` }}>
          {right}
        </div>
      </div>
    );
  }

  // Desktop: Horizontal split
  return (
    <div ref={containerRef} className="flex h-full w-full relative overflow-hidden">
      <div className="h-full overflow-hidden" style={{ width: `${leftWidth}%` }}>
        {left}
      </div>

      <div
        className={`relative flex items-center justify-center cursor-col-resize transition-all group z-20 ${
          isDragging ? 'w-2' : 'w-1 hover:w-2'
        }`}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent ${
          isDragging ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
        } transition-opacity`} />
        
        <div className={`absolute w-6 h-16 rounded-full bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg flex items-center justify-center ${
          isDragging ? 'scale-110' : 'scale-0 group-hover:scale-100'
        } transition-transform`}>
          <div className="flex gap-0.5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-0.5 h-4 bg-gray-400 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="h-full overflow-hidden" style={{ width: `${100 - leftWidth}%` }}>
        {right}
      </div>
    </div>
  );
};

export default ResizableSplitPane;