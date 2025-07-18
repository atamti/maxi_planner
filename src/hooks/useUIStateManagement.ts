import { useState } from "react";

export const useUIStateManagement = () => {
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  const handleLockedInteraction = () => {
    setShowLockedMessage(true);
    setTimeout(() => setShowLockedMessage(false), 3000);
  };

  return {
    showLockedMessage,
    handleLockedInteraction,
  };
};
