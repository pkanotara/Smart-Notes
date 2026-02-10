import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const styles = {
    success:
      "backdrop-blur-md bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 shadow-sm",
    error:
      "backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 shadow-sm",
    warning:
      "backdrop-blur-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-300 shadow-sm",
    info: "backdrop-blur-md bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 shadow-sm",
  };

  return (
    <div
      className={`
      flex items-center gap-3 px-4 py-3 rounded-xl 
      border shadow-lg backdrop-blur-xl animate-slide-in-right max-w-md
      ${styles[type]}
    `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
