import React, { useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { FormData } from "../../types";

interface Props {
  formData: FormData;
  onLoad: (data: FormData) => void;
}

export const SaveLoadSection: React.FC<Props> = ({ formData, onLoad }) => {
  const { savedConfigs, saveConfig, loadConfig, deleteConfig, renameConfig } =
    useLocalStorage();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleSave = () => {
    if (saveName.trim()) {
      saveConfig(saveName.trim(), formData);
      setSaveName("");
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = (id: string) => {
    const config = loadConfig(id);
    if (config) {
      onLoad(config);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameConfig(id, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleString();
  };

  // Add debug effect to see what's happening
  React.useEffect(() => {}, [savedConfigs]);

  return (
    <div className="card-themed rounded-none p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-poppins text-lg font-bold text-primary uppercase tracking-wide">
          💾 SAVE & LOAD CONFIGURATIONS
        </h3>
        <button
          onClick={() => setSaveDialogOpen(true)}
          className="btn-gradient-orange px-4 py-2 text-sm font-semibold uppercase tracking-wide"
        >
          💾 SAVE CURRENT
        </button>
      </div>

      {/* Save Dialog */}
      {saveDialogOpen && (
        <div className="mb-6 p-4 bg-surface-alt rounded-none border-2 border-bitcoin-orange/50">
          <h4 className="font-inter font-bold text-primary mb-3 uppercase tracking-wide">
            SAVE CURRENT CONFIGURATION
          </h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter configuration name..."
              className="flex-1 p-3 bg-surface border-2 border-themed rounded-none text-primary font-mono focus-ring-themed"
              onKeyPress={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="btn-gradient-orange px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SAVE
            </button>
            <button
              onClick={() => {
                setSaveDialogOpen(false);
                setSaveName("");
              }}
              className="btn-secondary-navy px-4 py-2"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Saved Configurations List */}
      {savedConfigs.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-secondary font-mono uppercase tracking-wide">
            FOUND {savedConfigs.length} SAVED CONFIGURATION(S)
          </div>
          {savedConfigs.map((config) => (
            <div
              key={config.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border"
            >
              <div className="flex-1">
                {editingId === config.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 p-1 border rounded text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleRename(config.id)
                      }
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(config.id)}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-gray-600">
                      Saved: {formatDate(config.savedAt)}
                    </div>
                  </div>
                )}
              </div>
              {editingId !== config.id && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleLoad(config.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    📁 Load
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(config.id);
                      setEditName(config.name);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    ✏️ Rename
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${config.name}"?`)) {
                        deleteConfig(config.id);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-secondary text-center py-8 font-mono">
          NO SAVED CONFIGURATIONS YET. SAVE YOUR CURRENT SETTINGS TO GET
          STARTED!
          <div className="text-xs mt-2 text-secondary/70 uppercase tracking-wide">
            CHECK BROWSER CONSOLE FOR LOCALSTORAGE DEBUG INFO
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-surface-alt rounded-none border-2 border-navy-900/50">
        <p className="text-sm text-navy-900 font-mono uppercase tracking-wide">
          💡 <span className="font-bold">NOTE:</span> CONFIGURATIONS ARE SAVED
          LOCALLY IN YOUR BROWSER. THEY WILL PERSIST BETWEEN SESSIONS BUT WON'T
          BE AVAILABLE ON OTHER DEVICES OR BROWSERS.
        </p>
      </div>
    </div>
  );
};
