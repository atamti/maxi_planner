import React from "react";

interface AllocationErrorDisplayProps {
  error: string | null;
}

export const AllocationErrorDisplay: React.FC<AllocationErrorDisplayProps> = ({
  error,
}) => {
  if (!error) return null;

  return (
    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  );
};
