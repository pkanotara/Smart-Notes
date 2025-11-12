import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type, onClose, autoClose }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const icons = {
    success: <CheckCircle size={16} className="flex-shrink-0" />,
    error: <AlertCircle size={16} className="flex-shrink-0" />,
    warning: <AlertTriangle size={16} className="flex-shrink-0" />,
    info: <Info size={16} className="flex-shrink-0" />,
  };

  const styles = {
    success: 'bg-emerald-500/90 dark:bg-emerald-600/90 text-white',
    error: 'bg-red-500/90 dark:bg-red-600/90 text-white',
    warning: 'bg-amber-500/90 dark:bg-amber-600/90 text-white',
    info: 'bg-blue-500/90 dark:bg-blue-600/90 text-white',
  };

  return (
    <div
      className={`
        flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl
        animate-slide-down backdrop-blur-2xl
        ${styles[type] || styles.info}
        border border-white/30
      `}
    >
      {icons[type] || icons.info}
      <p className="flex-1 text-xs sm:text-sm font-semibold leading-tight">{message}</p>
      <button
        onClick={onClose}
        className="p-0.5 sm:p-1 hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0"
        aria-label="Close notification"
      >
        <X size={14} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  const latestToast = toasts[toasts.length - 1];

  if (!latestToast) return null;

  return (
    <div className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[90vw] sm:max-w-md pointer-events-none px-2 sm:px-0">
      <div className="pointer-events-auto">
        <Toast
          message={latestToast.message}
          type={latestToast.type}
          onClose={() => removeToast(latestToast.id)}
          autoClose={true}
        />
      </div>
    </div>
  );
};

export default ToastContainer;