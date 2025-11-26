import React, { useState } from 'react';
import { X, Clock, RotateCcw, ChevronDown, ChevronUp, FileText, AlertCircle } from 'lucide-react';
import { versionService } from '../../utils/versionService';

const VersionHistory = ({ note, onRestore, onClose }) => {
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(null);

  const versions = versionService.getVersionHistory(note);

  const handleRestore = (version) => {
    onRestore(version);
    setConfirmRestore(null);
    onClose();
  };

  const toggleExpand = (versionId) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
    setConfirmRestore(null);
  };

  if (versions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-[#6366F1]" />
              <h2 className="text-lg font-bold text-[#171717] dark:text-[#FAFAFA]">
                Version History
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              <X size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
            </button>
          </div>

          {/* Empty State */}
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5F5] dark:bg-[#262626] rounded-2xl flex items-center justify-center">
              <FileText size={28} className="text-[#A3A3A3]" />
            </div>
            <h3 className="text-base font-semibold text-[#171717] dark:text-[#FAFAFA] mb-2">
              No version history yet
            </h3>
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              Version history will appear as you make changes to this note.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] dark:border-[#262626] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-[#6366F1]" />
            <h2 className="text-lg font-bold text-[#171717] dark:text-[#FAFAFA]">
              Version History
            </h2>
            <span className="px-2 py-0.5 bg-[#6366F1]/10 text-[#6366F1] text-xs font-semibold rounded-full">
              {versions.length} {versions.length === 1 ? 'version' : 'versions'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#262626] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
          </button>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {versions.map((version, index) => (
            <div
              key={version.versionId}
              className={`
                border rounded-xl transition-all
                ${expandedVersion === version.versionId
                  ? 'border-[#6366F1] bg-[#6366F1]/5 dark:bg-[#6366F1]/10'
                  : 'border-[#E5E5E5] dark:border-[#262626] hover:border-[#D4D4D4] dark:hover:border-[#404040]'
                }
              `}
            >
              {/* Version Header */}
              <button
                onClick={() => toggleExpand(version.versionId)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-[#F5F5F5] dark:bg-[#262626] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#737373] dark:text-[#A3A3A3]">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#171717] dark:text-[#FAFAFA] truncate">
                      {version.title}
                    </p>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                      {versionService.formatVersionTimestamp(version.timestamp)}
                    </p>
                  </div>
                </div>
                {expandedVersion === version.versionId ? (
                  <ChevronUp size={16} className="text-[#737373] dark:text-[#A3A3A3] flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-[#737373] dark:text-[#A3A3A3] flex-shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedVersion === version.versionId && (
                <div className="px-3 pb-3 space-y-3">
                  {/* Preview */}
                  <div className="bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-lg p-3">
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mb-1 font-medium">
                      Preview:
                    </p>
                    <p className="text-sm text-[#171717] dark:text-[#FAFAFA] leading-relaxed">
                      {versionService.getVersionPreview(version)}
                    </p>
                  </div>

                  {/* Tags */}
                  {version.tags && version.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {version.tags.slice(0, 5).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-0.5 bg-[#6366F1]/10 text-[#6366F1] text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {version.tags.length > 5 && (
                        <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                          +{version.tags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Restore Confirmation */}
                  {confirmRestore === version.versionId ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle size={16} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                          Are you sure you want to restore this version? Your current note will be saved to history first.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(version)}
                          className="flex-1 px-3 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Yes, Restore
                        </button>
                        <button
                          onClick={() => setConfirmRestore(null)}
                          className="flex-1 px-3 py-2 bg-[#F5F5F5] dark:bg-[#262626] hover:bg-[#E5E5E5] dark:hover:bg-[#363636] text-[#171717] dark:text-[#FAFAFA] text-xs font-bold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRestore(version.versionId)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#F5F5F5] dark:bg-[#262626] hover:bg-[#E5E5E5] dark:hover:bg-[#363636] text-[#171717] dark:text-[#FAFAFA] text-sm font-semibold rounded-lg transition-colors"
                    >
                      <RotateCcw size={14} />
                      Restore This Version
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626] flex-shrink-0">
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3] text-center">
            Up to {versionService.MAX_VERSIONS_PER_NOTE} versions are kept per note
          </p>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
