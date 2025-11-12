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
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: Mouse events (horizontal split)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - container.left) / container.width) * 100;

      if (newLeftWidth >= minSize && newLeftWidth <= maxSize) {
        setLeftWidth(newLeftWidth);
        onResize?.(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minSize, maxSize, onResize, isMobile]);

  // Mobile: Touch events (vertical split)
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const touch = e.touches[0];
      const container = containerRef.current.getBoundingClientRect();
      const newTopHeight = ((touch.clientY - container.top) / container.height) * 100;

      if (newTopHeight >= minSize && newTopHeight <= maxSize) {
        setLeftWidth(newTopHeight);
        onResize?.(newTopHeight);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, minSize, maxSize, onResize, isMobile]);

  // Desktop: Touch support for tablets
  useEffect(() => {
    if (isMobile) return;

    const handleTouchMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const touch = e.touches[0];
      const container = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((touch.clientX - container.left) / container.width) * 100;

      if (newLeftWidth >= minSize && newLeftWidth <= maxSize) {
        setLeftWidth(newLeftWidth);
        onResize?.(newLeftWidth);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, minSize, maxSize, onResize, isMobile]);

  // Mobile Layout (Vertical Split - Top/Bottom)
  if (isMobile) {
    return (
      <div ref={containerRef} className="flex flex-col h-full w-full relative overflow-hidden">
        {/* Top Pane (Editor) */}
        <div 
          className="w-full overflow-hidden"
          style={{ height: `${leftWidth}%` }}
        >
          {left}
        </div>

        {/* Vertical Resizable Divider */}
        <div
          className={`
            relative flex items-center justify-center cursor-row-resize
            transition-all duration-200 group z-30
            ${isDragging ? 'h-3' : 'h-2 active:h-3'}
          `}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onMouseDown={() => setIsDragging(true)}
        >
          {/* Divider Line with Glass Effect */}
          <div 
            className={`
              absolute inset-0 
              bg-gradient-to-b from-transparent via-gray-300/80 to-transparent
              ${isDragging ? 'opacity-100' : 'opacity-60'}
              transition-opacity duration-200
            `}
          />
          
          {/* Drag Handle - Mobile Optimized */}
          <div 
            className={`
              absolute h-7 w-20 rounded-full
              bg-white/90 backdrop-blur-xl
              border-2 border-gray-300/60
              shadow-xl
              flex items-center justify-center
              ${isDragging ? 'scale-110' : 'scale-100'}
              transition-transform duration-200
            `}
          >
            <div className="flex flex-col gap-0.5 items-center">
              <div className="h-0.5 w-8 bg-gray-400 rounded-full" />
              <div className="h-0.5 w-8 bg-gray-400 rounded-full" />
              <div className="h-0.5 w-8 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Bottom Pane (AI Insights) */}
        <div 
          className="w-full overflow-hidden"
          style={{ height: `${100 - leftWidth}%` }}
        >
          {right}
        </div>
      </div>
    );
  }

  // Desktop Layout (Horizontal Split - Left/Right)
  return (
    <div ref={containerRef} className="flex h-full w-full relative overflow-hidden">
      {/* Left Pane */}
      <div 
        className="h-full overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Horizontal Resizable Divider */}
      <div
        className={`
          relative flex items-center justify-center cursor-col-resize
          transition-all duration-200 group z-20
          ${isDragging ? 'w-2' : 'w-1 hover:w-2'}
        `}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Divider Line with Glass Effect */}
        <div 
          className={`
            absolute inset-0 
            bg-gradient-to-r from-transparent via-gray-300 to-transparent
            ${isDragging ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}
            transition-opacity duration-200
          `}
        />
        
        {/* Drag Handle */}
        <div 
          className={`
            absolute w-6 h-16 rounded-full
            bg-white/80 backdrop-blur-xl
            border border-gray-200/50
            shadow-lg
            flex items-center justify-center
            ${isDragging ? 'scale-110' : 'scale-0 group-hover:scale-100'}
            transition-transform duration-200
          `}
        >
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div 
        className="h-full overflow-hidden"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
};

export default ResizableSplitPane;