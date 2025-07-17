import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { FormData } from "../types";
import { useLocalStorage } from "./useLocalStorage";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage with our mock
Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
});

describe("useLocalStorage", () => {
  let mockDateNow: any;

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    // Mock Date.now to return predictable values
    mockDateNow = vi.spyOn(Date, "now");
  });

  afterEach(() => {
    mockDateNow?.mockRestore();
  });

  it("should initialize with empty savedConfigs when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage());

    expect(result.current.savedConfigs).toEqual([]);
  });

  it("should load saved configurations from localStorage on mount", () => {
    const testConfigs = [
      {
        id: "test-1",
        name: "Test Config",
        data: DEFAULT_FORM_DATA,
        savedAt: "2025-01-01T00:00:00.000Z",
      },
    ];

    mockLocalStorage.setItem(
      "btc_maxi_planner_configs",
      JSON.stringify(testConfigs),
    );

    const { result } = renderHook(() => useLocalStorage());

    expect(result.current.savedConfigs).toEqual(testConfigs);
  });

  it("should save a new configuration", () => {
    const { result } = renderHook(() => useLocalStorage());

    const testFormData: FormData = {
      ...DEFAULT_FORM_DATA,
      btcStack: 10,
    };

    act(() => {
      result.current.saveConfig("My Test Config", testFormData);
    });

    expect(result.current.savedConfigs).toHaveLength(1);
    expect(result.current.savedConfigs[0].name).toBe("My Test Config");
    expect(result.current.savedConfigs[0].data.btcStack).toBe(10);
    expect(result.current.savedConfigs[0].id).toBeDefined();
    expect(result.current.savedConfigs[0].savedAt).toBeDefined();
  });

  it("should persist saved configuration to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.saveConfig("Persistent Config", DEFAULT_FORM_DATA);
    });

    const storedData = mockLocalStorage.getItem("btc_maxi_planner_configs");
    expect(storedData).toBeDefined();

    const parsedData = JSON.parse(storedData!);
    expect(parsedData).toHaveLength(1);
    expect(parsedData[0].name).toBe("Persistent Config");
  });

  it("should delete a configuration by id", () => {
    const { result } = renderHook(() => useLocalStorage());

    // Mock different timestamps for each config
    mockDateNow.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    // Add two configurations
    act(() => {
      result.current.saveConfig("Config 1", DEFAULT_FORM_DATA);
    });

    act(() => {
      result.current.saveConfig("Config 2", DEFAULT_FORM_DATA);
    });

    expect(result.current.savedConfigs).toHaveLength(2);

    // Since new configs are prepended, Config 2 is at index 0, Config 1 is at index 1
    const firstConfigId = result.current.savedConfigs[1].id; // This is Config 1

    // Delete Config 1
    act(() => {
      result.current.deleteConfig(firstConfigId);
    });

    expect(result.current.savedConfigs).toHaveLength(1);
    expect(result.current.savedConfigs[0].name).toBe("Config 2");
  });

  it("should update localStorage when deleting a configuration", () => {
    const { result } = renderHook(() => useLocalStorage());

    mockDateNow.mockReturnValue(1000);

    act(() => {
      result.current.saveConfig("To Delete", DEFAULT_FORM_DATA);
    });

    const configId = result.current.savedConfigs[0].id;

    act(() => {
      result.current.deleteConfig(configId);
    });

    // When last config is deleted, localStorage should be cleared
    const storedData = mockLocalStorage.getItem("btc_maxi_planner_configs");
    expect(storedData).toBeNull();
  });

  it("should handle localStorage errors gracefully", () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = mockLocalStorage.getItem;
    mockLocalStorage.getItem = vi.fn(() => {
      throw new Error("localStorage error");
    });

    // Should not throw an error
    expect(() => {
      renderHook(() => useLocalStorage());
    }).not.toThrow();

    // Restore original method
    mockLocalStorage.getItem = originalGetItem;
  });

  it("should handle malformed JSON in localStorage gracefully", () => {
    mockLocalStorage.setItem("btc_maxi_planner_configs", "invalid json");

    // Should not throw an error and should initialize with empty array
    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.savedConfigs).toEqual([]);
  });

  it("should generate unique IDs for each saved configuration", () => {
    const { result } = renderHook(() => useLocalStorage());

    // Mock different timestamps to ensure unique IDs
    mockDateNow.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    act(() => {
      result.current.saveConfig("Config 1", DEFAULT_FORM_DATA);
    });

    act(() => {
      result.current.saveConfig("Config 2", DEFAULT_FORM_DATA);
    });

    const ids = result.current.savedConfigs.map((config) => config.id);
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
  });

  it("should create proper timestamp for savedAt field", () => {
    const { result } = renderHook(() => useLocalStorage());

    const beforeSave = new Date().toISOString();

    act(() => {
      result.current.saveConfig("Timestamp Test", DEFAULT_FORM_DATA);
    });

    const afterSave = new Date().toISOString();
    const savedAt = result.current.savedConfigs[0].savedAt;

    expect(savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(savedAt >= beforeSave).toBe(true);
    expect(savedAt <= afterSave).toBe(true);
  });
});
