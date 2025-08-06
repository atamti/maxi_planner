# Hook Refactoring Analysis & Opportunities

## Current Hook Architecture Analysis

### 1. **Categorization of Existing Hooks**

#### **Core Business Logic Hooks**

- `useCalculations.ts` - Portfolio calculations
- `useCalculations.enhanced.ts` - Enhanced version with consolidated logic
- `useLoanCalculations.ts` - Loan-specific calculations
- `usePortfolioAnalysis.ts` - Portfolio performance analysis
- `usePortfolioInsights.ts` - Portfolio insights and metrics

#### **Rate Generation Hooks**

- `useRateGeneration.ts` - Core rate generation logic
- `useRateGeneration.enhanced.ts` - Enhanced consolidated version
- `useBtcRateGeneration.ts` - BTC-specific rate features
- `useBtcAutoApplyEffects.ts` - Auto-apply rate effects
- `useBtcScenarioManagement.ts` - BTC scenario handling

#### **UI State & Interaction Hooks**

- `useAllocation.ts` - Basic allocation logic
- `useAllocation.enhanced.ts` - Consolidated allocation management
- `useAllocationAdjustment.ts` - Allocation value adjustments
- `useAllocationColors.ts` - Color management for allocation
- `useAllocationHighlight.ts` - Highlight state for allocation
- `useUIStateManagement.ts` - General UI state
- `useExchangeRateHandling.ts` - Exchange rate input handling

#### **Chart & Visualization Hooks**

- `useChartConfig.ts` - Chart configuration
- `useChartData.ts` - Chart data preparation
- `useChartCoordinates.ts` - Coordinate calculations
- `useChartDrag.ts` - Drag interaction logic
- `useChartRendering.ts` - Chart rendering logic
- `useResponsiveSize.ts` - Responsive size handling

#### **Form & Data Management Hooks**

- `useFormValidation.ts` - Form validation logic
- `useFormReset.ts` - Form reset functionality
- `useLocalStorage.ts` - Persistent storage
- `useScenarioManagement.ts` - Economic scenario management

## 2. **Identified Shared Logic Patterns**

### **Pattern A: State Management + Validation**

**Found in**: `useAllocation*`, `useFormValidation`, `useExchangeRateHandling`

```typescript
// Common pattern:
const [value, setValue] = useState(initialValue);
const isValid = useMemo(() => validateLogic(value), [value]);
const updateValue = useCallback((newValue) => {
  if (validate(newValue)) setValue(newValue);
}, []);
```

### **Pattern B: Economic Scenario Handling**

**Found in**: `useRateGeneration*`, `useBtcScenarioManagement`, `useScenarioManagement`

```typescript
// Common pattern:
const applyScenario = useCallback(
  (scenarioKey) => {
    const scenario = economicScenarios[scenarioKey];
    return generateRatesFromScenario(scenario, timeHorizon);
  },
  [economicScenarios, timeHorizon],
);
```

### **Pattern C: Chart Coordination System**

**Found in**: `useChart*` hooks

```typescript
// Common pattern:
const coordinates = useChartCoordinates(props);
const dragLogic = useChartDrag(coordinates, data, onChange);
const rendering = useChartRendering(coordinates, data);
```

### **Pattern D: UI State + Interaction Effects**

**Found in**: `useAllocationHighlight`, `useUIStateManagement`, `useExchangeRateHandling`

```typescript
// Common pattern:
const [uiState, setUIState] = useState(defaultState);
const handleInteraction = useCallback(() => {
  setUIState(newState);
  setTimeout(() => setUIState(defaultState), timeout);
}, []);
```

### **Pattern E: Form Data Transformations**

**Found in**: Many hooks that work with `FormData`

```typescript
// Common pattern:
const transformedData = useMemo(() => {
  return processFormData(formData, config);
}, [formData, config]);
```

## 3. **Refactoring Opportunities**

### **Opportunity 1: Create Shared Logic Utilities**

#### A. **Form State Management Utility**

```typescript
// hooks/shared/useFormState.ts
export const useFormState = <T>(
  initialValue: T,
  validator?: (value: T) => boolean,
  transformer?: (value: T) => T,
) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback(
    (newValue: T) => {
      const processedValue = transformer ? transformer(newValue) : newValue;
      if (!validator || validator(processedValue)) {
        setValue(processedValue);
        setError(null);
      } else {
        setError("Invalid value");
      }
    },
    [validator, transformer],
  );

  return { value, setValue: updateValue, error, isValid: !error };
};
```

#### B. **Scenario Management Utility**

```typescript
// hooks/shared/useScenarioLogic.ts
export const useScenarioLogic = (
  economicScenarios: any,
  timeHorizon: number,
  rateGenerator: (scenario: any, horizon: number) => number[],
) => {
  const applyScenario = useCallback(
    (scenarioKey: string) => {
      const scenario = economicScenarios[scenarioKey];
      if (!scenario) throw new Error(`Scenario not found: ${scenarioKey}`);
      return rateGenerator(scenario, timeHorizon);
    },
    [economicScenarios, timeHorizon, rateGenerator],
  );

  return { applyScenario };
};
```

#### C. **UI Interaction Effects Utility**

```typescript
// hooks/shared/useInteractionEffects.ts
export const useInteractionEffects = <T>(
  initialState: T,
  effectDuration: number = 3000,
) => {
  const [state, setState] = useState(initialState);
  const [isActive, setIsActive] = useState(false);

  const triggerEffect = useCallback(
    (newState: T) => {
      setState(newState);
      setIsActive(true);
      setTimeout(() => {
        setState(initialState);
        setIsActive(false);
      }, effectDuration);
    },
    [initialState, effectDuration],
  );

  return { state, isActive, triggerEffect };
};
```

### **Opportunity 2: Consolidate Related Hook Families**

#### A. **Chart Ecosystem Consolidation**

Instead of separate `useChart*` hooks, create a unified chart system:

```typescript
// hooks/charts/useChartSystem.ts
export const useChartSystem = (config: ChartConfig) => {
  const coordinates = useChartCoordinates(config);
  const dragLogic = useChartDrag(config, coordinates);
  const rendering = useChartRendering(config, coordinates);
  const responsive = useResponsiveSize(config.initialWidth);

  return {
    ...coordinates,
    ...dragLogic,
    ...rendering,
    ...responsive,
  };
};
```

#### B. **Allocation Management Consolidation**

The `useAllocation.enhanced.ts` is already a good start, but could be further optimized:

```typescript
// hooks/allocation/useAllocationSystem.ts
export const useAllocationSystem = (options: AllocationOptions) => {
  const state = useFormState(options.initialAllocation, validateAllocation);
  const interactions = useInteractionEffects({ highlight: null });
  const colors = useAllocationColors();

  return {
    ...state,
    ...interactions,
    ...colors,
    // Consolidated allocation logic
  };
};
```

### **Opportunity 3: Extract Common Calculation Patterns**

#### A. **Rate Calculation Engine**

```typescript
// hooks/shared/useRateCalculationEngine.ts
export const useRateCalculationEngine = () => {
  const generateFlat = useCallback((rate: number, horizon: number) => {
    return Array(horizon + 1).fill(rate);
  }, []);

  const generateLinear = useCallback(
    (start: number, end: number, horizon: number) => {
      const rates = [];
      for (let i = 0; i <= horizon; i++) {
        rates.push(start + (end - start) * (i / horizon));
      }
      return rates;
    },
    [],
  );

  const generateFromScenario = useCallback((scenario: any, horizon: number) => {
    // Common scenario-to-rates logic
  }, []);

  return { generateFlat, generateLinear, generateFromScenario };
};
```

### **Opportunity 4: Create Hook Composition Patterns**

#### A. **Higher-Order Hook Pattern**

```typescript
// hooks/shared/withValidation.ts
export const withValidation = <T extends (...args: any[]) => any>(
  useHook: T,
  validator: (result: ReturnType<T>) => boolean,
) => {
  return (...args: Parameters<T>): ReturnType<T> & { isValid: boolean } => {
    const result = useHook(...args);
    const isValid = validator(result);
    return { ...result, isValid };
  };
};

// Usage:
const useValidatedAllocation = withValidation(
  useAllocation,
  (result) => result.totalAllocation === 100,
);
```

#### B. **Hook Factory Pattern**

```typescript
// hooks/shared/createFormHook.ts
export const createFormHook = <T>(
  field: keyof FormData,
  validator?: (value: T) => boolean,
  transformer?: (value: T) => T,
) => {
  return () => {
    const { formData, updateFormData } = usePortfolioCompat();
    const { value, setValue, error, isValid } = useFormState(
      formData[field] as T,
      validator,
      transformer,
    );

    const updateField = useCallback(
      (newValue: T) => {
        setValue(newValue);
        updateFormData({ [field]: newValue });
      },
      [setValue, updateFormData],
    );

    return { value, updateField, error, isValid };
  };
};

// Usage:
const useBtcStack = createFormHook("btcStack", (value) => value > 0);
const useTimeHorizon = createFormHook(
  "timeHorizon",
  (value) => value >= 1 && value <= 30,
);
```

## 4. **Proposed Refactoring Implementation Plan**

### **Phase 1: Extract Shared Utilities** (Low Risk)

1. Create `hooks/shared/` directory
2. Extract common patterns into utility hooks
3. Update existing hooks to use utilities
4. Verify tests still pass

### **Phase 2: Consolidate Hook Families** (Medium Risk)

1. Create consolidated chart system
2. Enhance allocation system consolidation
3. Create rate calculation engine
4. Update components to use consolidated hooks

### **Phase 3: Implement Composition Patterns** (Higher Risk)

1. Create higher-order hook utilities
2. Implement hook factory patterns
3. Create domain-specific hook collections
4. Refactor components to use new patterns

### **Phase 4: Clean Up Legacy Hooks** (Low Risk)

1. Remove unused individual hooks
2. Update imports throughout codebase
3. Remove duplicate code
4. Final test validation

## 5. **Benefits of Refactoring**

### **Immediate Benefits**

- **Reduced Code Duplication**: Eliminate repeated patterns across hooks
- **Improved Maintainability**: Centralized logic is easier to update
- **Better Testing**: Shared utilities can be tested independently
- **Consistent Behavior**: Standard patterns ensure consistent UX

### **Long-term Benefits**

- **Easier Feature Addition**: New features can leverage existing patterns
- **Improved Performance**: Better memoization and optimization opportunities
- **Enhanced Developer Experience**: Clearer separation of concerns
- **Reduced Bundle Size**: Elimination of duplicate code

## 6. **Recommended Starting Points**

1. **Start with `useInteractionEffects`** - Low risk, high impact utility
2. **Consolidate allocation hooks** - Build on existing enhanced version
3. **Extract rate calculation engine** - High reuse potential
4. **Create chart system consolidation** - Complex but high value

This analysis provides a roadmap for systematic hook refactoring that will improve code quality while maintaining the clean test suite we've achieved.
