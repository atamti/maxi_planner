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
  React.useEffect(() => {
    
  }, [savedConfigs]);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">💾 Save & Load Configurations</h3>
        <button
          onClick={() => setSaveDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          💾 Save Current
        </button>
      </div>

      {/* Save Dialog */}
      {saveDialogOpen && (
        <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-medium mb-2">Save Current Configuration</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter configuration name..."
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setSaveDialogOpen(false);
                setSaveName("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Configurations List */}
      {savedConfigs.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 mb-2">
            Found {savedConfigs.length} saved configuration(s)
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
        <div className="text-gray-500 text-center py-8">
          No saved configurations yet. Save your current settings to get
          started!
          <div className="text-xs mt-2">
            Check browser console for localStorage debug info
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 <strong>Note:</strong> Configurations are saved locally in your
          browser. They will persist between sessions but won't be available on
          other devices or browsers.
        </p>
      </div>
    </div>
  );
};
