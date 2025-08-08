import React from "react";

interface ScenarioRestoreMessageProps {
  show: boolean;
  onRestoreAll: () => void;
  onDismiss: () => void;
  sectionCount: number;
}

export const ScenarioRestoreMessage: React.FC<ScenarioRestoreMessageProps> = ({
  show,
  onRestoreAll,
  onDismiss,
  sectionCount,
}) => {
  if (!show) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xs">ℹ️</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-800">
            Scenario Control Available
          </h4>
          <p className="text-xs text-blue-700 mt-1">
            {sectionCount} section{sectionCount > 1 ? "s are" : " is"} currently
            on manual mode to preserve your changes.
          </p>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={onRestoreAll}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Auto-follow scenario for all sections
            </button>
            <button
              onClick={onDismiss}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Keep manual control
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
