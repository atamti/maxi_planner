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
    <div className="mb-4 p-4 bg-surface-alt border-2 border-bitcoin-orange rounded-none">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-none bg-bitcoin-orange/20 flex items-center justify-center">
            <span className="text-bitcoin-orange text-sm font-bold">⚠</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-bitcoin-orange uppercase tracking-wide">
            SCENARIO AUTO-FOLLOW AVAILABLE
          </h4>
          <p className="text-xs text-secondary mt-1 font-mono">
            {sectionCount} section{sectionCount > 1 ? "s are" : " is"} currently
            in manual mode to preserve your changes.
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={onRestoreAll}
              className="text-xs font-bold uppercase bg-bitcoin-orange text-surface-primary px-3 py-2 rounded-none hover:bg-orange-600 active:bg-orange-700 transition-colors"
            >
              AUTO-FOLLOW SCENARIO
            </button>
            <button
              onClick={onDismiss}
              className="text-xs font-bold uppercase text-bitcoin-orange hover:text-orange-600 transition-colors border border-bitcoin-orange px-3 py-2 rounded-none hover:bg-bitcoin-orange/10"
            >
              KEEP MANUAL CONTROL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
