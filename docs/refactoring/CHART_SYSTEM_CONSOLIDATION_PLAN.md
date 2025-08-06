# Chart System Consolidation Analysis

## 📊 **Current Chart Hook Architecture**

### **Hook Dependencies & Usage:**

```
┌─ useChartConfig ─────────────────────┐
│  • Chart.js configurations          │
│  • Used by: ChartsSection           │
│  • Dependencies: CalculationResults │
└──────────────────────────────────────┘

┌─ useChartData ───────────────────────┐
│  • Chart.js data preparation        │
│  • Used by: ChartsSection           │
│  • Dependencies: CalculationResults │
└──────────────────────────────────────┘

┌─ useChartCoordinates ────────────────┐
│  • SVG coordinate calculations      │
│  • Used by: DraggableRateChart      │
│  • Dependencies: dimensions, data   │
└──────────────────────────────────────┘

┌─ useChartDrag ───────────────────────┐
│  • Interactive dragging logic       │
│  • Used by: DraggableRateChart      │
│  • Dependencies: coordinates, data  │
└──────────────────────────────────────┘

┌─ useChartRendering ──────────────────┐
│  • SVG path generation             │
│  • Used by: DraggableRateChart      │
│  • Dependencies: coordinates, data  │
└──────────────────────────────────────┘
```

## 🎯 **Consolidation Opportunities**

### **Two Distinct Chart Systems:**

1. **Static Charts (Chart.js)**: `useChartConfig` + `useChartData`
2. **Interactive Charts (SVG)**: `useChartCoordinates` + `useChartDrag` + `useChartRendering`

### **Consolidation Strategy:**

#### **Option A: Unified Chart System**

```typescript
useChartSystem({
  type: 'static' | 'interactive',
  data: ChartData,
  config: ChartConfig,
  interactions?: InteractionConfig
})
```

#### **Option B: Specialized Chart Systems** (Recommended)

```typescript
// For Chart.js static charts
useStaticChartSystem({
  calculationResults,
  formData,
  onUpdateFormData,
});

// For SVG interactive charts
useInteractiveChartSystem({
  data,
  onChange,
  dimensions,
  readOnly,
});
```

## 🚀 **Recommended Approach: Option B**

**Benefits:**

- ✅ Clear separation of concerns
- ✅ Maintains specialized functionality
- ✅ Easier to test and maintain
- ✅ Follows our shared utility pattern
- ✅ Reduces import complexity

**Implementation Plan:**

1. Create `useStaticChartSystem` (consolidates `useChartConfig` + `useChartData`)
2. Create `useInteractiveChartSystem` (consolidates `useChartCoordinates` + `useChartDrag` + `useChartRendering`)
3. Use our existing shared utilities where applicable
4. Update components to use consolidated systems
5. Remove individual hooks after validation
