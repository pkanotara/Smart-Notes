import React, { useState } from "react";
import { Lock, Unlock, X, Eye, EyeOff, AlertCircle } from "lucide-react";

const PasswordProtection = ({ mode, onSubmit, onCancel }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const isLocking = mode === "set";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (isLocking) {
      if (!confirmPassword) {
        setError("Please confirm your password");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    onSubmit(password);
  };

  const getStrength = () => {
    if (password.length < 6) return { label: "Weak", width: "w-1/3", color: "bg-red-500", text: "text-red-600" };
    if (password.length < 10) return { label: "Medium", width: "w-2/3", color: "bg-amber-500", text: "text-amber-600" };
    return { label: "Strong", width: "w-full", color: "bg-green-500", text: "text-green-600" };
  };

  const strength = getStrength();
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl max-w-md w-full border border-[#E5E5E5] dark:border-[#262626] animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${isLocking ? "from-amber-500 to-orange-500" : "from-green-500 to-emerald-500"} rounded-xl flex items-center justify-center shadow-lg`}>
              {isLocking ? <Lock className="text-white" size={24} /> : <Unlock className="text-white" size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#171717] dark:text-[#FAFAFA]">
                {isLocking ? "Encrypt Note" : "Decrypt Note"}
              </h2>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                {isLocking ? "Secure your note with a password" : "Enter password to unlock"}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
            <X size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-[#171717] dark:text-[#E5E5E5] mb-2">
              {isLocking ? "Create Password" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] dark:text-[#525252]" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={isLocking ? "Enter password (min 6 characters)" : "Enter your password"}
                className="w-full pl-10 pr-12 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] rounded-xl border border-[#E5E5E5] dark:border-[#262626] focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-[#A3A3A3] text-sm font-medium"
                autoFocus
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-lg transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} className="text-[#A3A3A3]" /> : <Eye size={18} className="text-[#A3A3A3]" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for set mode) */}
          {isLocking && (
            <div>
              <label className="block text-sm font-semibold text-[#171717] dark:text-[#E5E5E5] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] dark:text-[#525252]" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-12 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] rounded-xl border ${
                    password && confirmPassword && password !== confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[#E5E5E5] dark:border-[#262626] focus:ring-[#6366F1]"
                  } focus:outline-none focus:ring-2 placeholder:text-[#A3A3A3] text-sm font-medium`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-lg transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} className="text-[#A3A3A3]" /> : <Eye size={18} className="text-[#A3A3A3]" />}
                </button>
              </div>

              {/* Match Indicator */}
              {password && confirmPassword && (
                <div className={`mt-2 flex items-center gap-2 text-xs font-semibold ${passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    {passwordsMatch ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#171717] dark:text-[#E5E5E5] rounded-xl font-bold hover:bg-[#E5E5E5] dark:hover:bg-[#262626] transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-lg flex items-center justify-center gap-2 ${
                isLocking
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              }`}
            >
              {isLocking ? <><Lock size={18} /> Encrypt Note</> : <><Unlock size={18} /> Unlock Note</>}
            </button>
          </div>
        </form>

        {/* Strength Indicator (only for set mode) */}
        {isLocking && password && (
          <div className="px-6 pb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#737373] dark:text-[#A3A3A3]">Password Strength</span>
                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="h-2 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.width} ${strength.color}`} />
              </div>
              {password.length < 6 && (
                <p className="text-[10px] text-red-500 dark:text-red-400 font-medium">Minimum 6 characters required</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordProtection;