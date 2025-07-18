import React, { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const CollapsibleSection: React.FC<Props> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center rounded-t-lg"
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-gray-600">{isExpanded ? "−" : "+"}</span>
      </button>
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
