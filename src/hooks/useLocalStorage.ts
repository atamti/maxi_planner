import { useEffect, useState } from "react";
import { FormData } from "../types";

const STORAGE_KEY = "btc_maxi_planner_configs";

interface SavedConfig {
  id: string;
  name: string;
  data: FormData;
  savedAt: string;
}

export const useLocalStorage = () => {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  // Load saved configurations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log("Loading from localStorage:", stored); // Debug log
      if (stored) {
        const configs = JSON.parse(stored);
        setSavedConfigs(configs);
        console.log("Loaded configs:", configs); // Debug log
      }
    } catch (error) {
      console.error("Error loading saved configurations:", error);
    }
  }, []);

  // Save configurations to localStorage whenever savedConfigs changes
  useEffect(() => {
    try {
      if (savedConfigs.length > 0) {
        // Only save if we have configs
        const configsJson = JSON.stringify(savedConfigs);
        localStorage.setItem(STORAGE_KEY, configsJson);
        console.log("Saved to localStorage:", configsJson); // Debug log
      }
    } catch (error) {
      console.error("Error saving configurations:", error);
    }
  }, [savedConfigs]);

  const saveConfig = (name: string, data: FormData): string => {
    const id = Date.now().toString();
    const newConfig: SavedConfig = {
      id,
      name,
      data,
      savedAt: new Date().toISOString(),
    };

    setSavedConfigs((prev) => {
      const newConfigs = [newConfig, ...prev];
      console.log("Adding new config, total configs:", newConfigs.length); // Debug log
      return newConfigs;
    });
    return id;
  };

  const loadConfig = (id: string): FormData | null => {
    const config = savedConfigs.find((c) => c.id === id);
    return config ? config.data : null;
  };

  const deleteConfig = (id: string): void => {
    setSavedConfigs((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // If we're deleting the last config, clear localStorage
      if (filtered.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      }
      return filtered;
    });
  };

  const renameConfig = (id: string, newName: string): void => {
    setSavedConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c)),
    );
  };

  return {
    savedConfigs,
    saveConfig,
    loadConfig,
    deleteConfig,
    renameConfig,
  };
};
