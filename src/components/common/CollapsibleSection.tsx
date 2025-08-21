import React, { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  noGrid?: boolean; // Allow disabling the grid layout
}

export const CollapsibleSection: React.FC<Props> = ({
  title,
  children,
  defaultExpanded = false,
  noGrid = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 border border-[var(--color-border)] rounded-none">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left bg-surface-alt hover:bg-surface flex justify-between items-center rounded-none font-heading tracking-wide transition-colors"
      >
        <h3 className="font-semibold text-primary">{title.toUpperCase()}</h3>
        <span className="text-[var(--color-accent)] font-bold">
          {isExpanded ? "−" : "+"}
        </span>
      </button>
      {isExpanded && (
        <div className="p-4 bg-surface rounded-none">
          {noGrid ? (
            children
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
