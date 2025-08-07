import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFormState } from "./useFormState";

describe("useFormState", () => {
  describe("Basic functionality", () => {
    it("should initialize with provided value", () => {
      const { result } = renderHook(() => useFormState("initial value"));

      expect(result.current.value).toBe("initial value");
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
      expect(result.current.hasError).toBe(false);
    });

    it("should update value correctly", () => {
      const { result } = renderHook(() => useFormState("initial"));

      act(() => {
        result.current.setValue("updated");
      });

      expect(result.current.value).toBe("updated");
      expect(result.current.error).toBeNull();
    });

    it("should work with different data types", () => {
      const numberHook = renderHook(() => useFormState(42));
      const booleanHook = renderHook(() => useFormState(true));
      const objectHook = renderHook(() => useFormState({ name: "test" }));

      expect(numberHook.result.current.value).toBe(42);
      expect(booleanHook.result.current.value).toBe(true);
      expect(objectHook.result.current.value).toEqual({ name: "test" });
    });
  });

  describe("Transformer functionality", () => {
    it("should apply transformer to initial value", () => {
      const transformer = (value: string) => value.toUpperCase();
      const { result } = renderHook(() =>
        useFormState("hello", undefined, transformer),
      );

      expect(result.current.value).toBe("HELLO");
    });

    it("should apply transformer when updating value", () => {
      const transformer = (value: string) => value.trim().toLowerCase();
      const { result } = renderHook(() =>
        useFormState("", undefined, transformer),
      );

      act(() => {
        result.current.setValue("  HELLO WORLD  ");
      });

      expect(result.current.value).toBe("hello world");
    });

    it("should handle transformer with complex logic", () => {
      const transformer = (value: number) => Math.max(0, Math.min(100, value));
      const { result } = renderHook(() =>
        useFormState(50, undefined, transformer),
      );

      act(() => {
        result.current.setValue(150);
      });
      expect(result.current.value).toBe(100);

      act(() => {
        result.current.setValue(-50);
      });
      expect(result.current.value).toBe(0);
    });

    it("should work without transformer", () => {
      const { result } = renderHook(() => useFormState("test"));

      act(() => {
        result.current.setValue("updated");
      });

      expect(result.current.value).toBe("updated");
    });
  });

  describe("Validator functionality", () => {
    it("should validate initial value", () => {
      const validator = (value: string) => ({
        isValid: value.length > 3,
        error: value.length <= 3 ? "Too short" : undefined,
      });

      const { result } = renderHook(() => useFormState("ab", validator));

      expect(result.current.isValid).toBe(false);
      expect(result.current.value).toBe("ab");
    });

    it("should validate when updating value", () => {
      const validator = (value: string) => ({
        isValid: value.includes("@"),
        error: value.includes("@") ? undefined : "Must include @",
      });

      const { result } = renderHook(() => useFormState<string>("", validator));

      act(() => {
        result.current.setValue("invalid");
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe("Must include @");
      expect(result.current.hasError).toBe(true);
      expect(result.current.value).toBe("invalid"); // Value should still update
    });

    it("should clear error when value becomes valid", () => {
      const validator = (value: string) => ({
        isValid: value.length >= 3,
        error: value.length < 3 ? "Too short" : undefined,
      });

      const { result } = renderHook(() => useFormState<string>("", validator));

      // Start invalid
      act(() => {
        result.current.setValue("ab");
      });
      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe("Too short");

      // Become valid
      act(() => {
        result.current.setValue("abc");
      });
      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.hasError).toBe(false);
    });

    it("should use default error message when validator provides none", () => {
      const validator = (value: string) => ({
        isValid: value.length > 0,
        // No error message provided
      });

      const { result } = renderHook(() => useFormState<string>("", validator));

      act(() => {
        result.current.setValue("");
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe("Invalid value");
    });

    it("should work without validator", () => {
      const { result } = renderHook(() => useFormState("test"));

      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBeNull();

      act(() => {
        result.current.setValue("anything");
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe("Combined transformer and validator", () => {
    it("should apply transformer before validation", () => {
      const transformer = (value: string) => value.trim();
      const validator = (value: string) => ({
        isValid: value.length > 0,
        error: value.length === 0 ? "Cannot be empty" : undefined,
      });

      const { result } = renderHook(() =>
        useFormState("", validator, transformer),
      );

      act(() => {
        result.current.setValue("   "); // Whitespace that will be trimmed
      });

      expect(result.current.value).toBe("");
      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe("Cannot be empty");
    });

    it("should validate transformed initial value", () => {
      const transformer = (value: string) => value.toUpperCase();
      const validator = (value: string) => ({
        isValid: value === value.toUpperCase(),
        error: value !== value.toUpperCase() ? "Must be uppercase" : undefined,
      });

      const { result } = renderHook(() =>
        useFormState("hello", validator, transformer),
      );

      expect(result.current.value).toBe("HELLO");
      expect(result.current.isValid).toBe(true);
    });

    it("should handle complex validation with transformation", () => {
      const transformer = (value: number) => Math.round(value);
      const validator = (value: number) => ({
        isValid: value >= 0 && value <= 100,
        error:
          value < 0 || value > 100 ? "Must be between 0 and 100" : undefined,
      });

      const { result } = renderHook(() =>
        useFormState(50.7, validator, transformer),
      );

      expect(result.current.value).toBe(51);
      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setValue(150.3);
      });

      expect(result.current.value).toBe(150);
      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe("Must be between 0 and 100");
    });
  });

  describe("Edge cases and error conditions", () => {
    it("should handle null and undefined values", () => {
      const nullHook = renderHook(() => useFormState(null));
      const undefinedHook = renderHook(() => useFormState(undefined));

      expect(nullHook.result.current.value).toBeNull();
      expect(undefinedHook.result.current.value).toBeUndefined();
    });

    it("should handle validator that throws error", () => {
      const faultyValidator = (_value: string) => {
        throw new Error("Validator error");
      };

      // This should not crash the hook
      expect(() => {
        renderHook(() => useFormState("test", faultyValidator));
      }).toThrow("Validator error");
    });

    it("should handle transformer that throws error", () => {
      const faultyTransformer = (_value: string) => {
        throw new Error("Transformer error");
      };

      expect(() => {
        renderHook(() => useFormState("test", undefined, faultyTransformer));
      }).toThrow("Transformer error");
    });

    it("should handle validator returning invalid format", () => {
      const badValidator = (_value: string) =>
        ({
          // Missing isValid property
          error: "Some error",
        }) as any;

      const { result } = renderHook(() => useFormState("test", badValidator));

      // Should fallback gracefully
      expect(typeof result.current.isValid).toBe("boolean");
    });

    it("should handle empty string errors correctly", () => {
      const validator = (value: string) => ({
        isValid: value.length > 0,
        error: "", // Empty string error
      });

      const { result } = renderHook(() => useFormState("", validator));

      act(() => {
        result.current.setValue("");
      });

      expect(result.current.error).toBe("Invalid value"); // Should use default
    });

    it("should handle very large objects", () => {
      const largeObject = { data: new Array(10000).fill("test") };
      const { result } = renderHook(() => useFormState(largeObject));

      expect(result.current.value).toBe(largeObject);

      act(() => {
        result.current.setValue({ data: ["updated"] });
      });

      expect(result.current.value).toEqual({ data: ["updated"] });
    });
  });

  describe("Performance and stability", () => {
    it("should maintain stable references when possible", () => {
      const { result, rerender } = renderHook(() => useFormState("test"));

      const firstSetValue = result.current.setValue;

      rerender();

      expect(result.current.setValue).toBe(firstSetValue);
    });

    it("should memoize validation results", () => {
      const validator = vi.fn((value: string) => ({
        isValid: value.length > 0,
        error: value.length === 0 ? "Required" : undefined,
      }));

      const { result, rerender } = renderHook(() =>
        useFormState("test", validator),
      );

      const initialCallCount = validator.mock.calls.length;

      // Re-render without changing value
      rerender();

      expect(validator.mock.calls.length).toBe(initialCallCount);
      expect(result.current.isValid).toBe(true);
    });

    it("should handle rapid updates correctly", () => {
      const { result } = renderHook(() => useFormState(""));

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.setValue(`value-${i}`);
        }
      });

      expect(result.current.value).toBe("value-99");
    });
  });

  describe("Type safety", () => {
    it("should maintain type safety with generic types", () => {
      interface TestObject {
        id: number;
        name: string;
      }

      const { result } = renderHook(() =>
        useFormState<TestObject>({ id: 1, name: "test" }),
      );

      expect(result.current.value.id).toBe(1);
      expect(result.current.value.name).toBe("test");

      act(() => {
        result.current.setValue({ id: 2, name: "updated" });
      });

      expect(result.current.value.id).toBe(2);
      expect(result.current.value.name).toBe("updated");
    });
  });
});
