import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

const PasswordProtection = ({ mode, onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl max-w-md w-full animate-scale-in border border-gray-200 dark:border-dark-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  {mode === 'set' ? 'Encrypt Note' : 'Decrypt Note'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'set' ? 'Set a password to protect your note' : 'Enter password to unlock'}
                </p>
              </div>
            </div>
            <button onClick={onCancel} className="btn-icon">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'set' ? 'Create a strong password' : 'Enter your password'}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-dark-700 border-2 border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === 'set' && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                💡 Use a strong password. You won't be able to recover it if forgotten.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={!password.trim()}
            >
              {mode === 'set' ? 'Encrypt' : 'Decrypt'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="p-6 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 rounded-b-3xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                AES-256 Encryption
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your notes are encrypted client-side using military-grade encryption. 
                We cannot recover your password if you forget it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;