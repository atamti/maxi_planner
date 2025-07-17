# Testing Setup

This project uses [Vitest](https://vitest.dev/) for fast unit and integration testing with full TypeScript support.

## Running Tests

### Available Scripts

```bash
# Run tests in watch mode (recommended during development)
npm run test

# Run tests once and exit
npm run test:run

# Run tests with a UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are co-located with their source files using the following naming conventions:

- `*.test.ts` - For utility functions and hooks
- `*.test.tsx` - For React components

### Example Test Files

1. **`src/utils/formatNumber.test.ts`** - Unit tests for utility functions
2. **`src/hooks/useCalculations.test.ts`** - Tests for React hooks
3. **`src/components/common/ToggleSwitch.test.tsx`** - Component tests

### Testing Libraries Included

- **Vitest** - Fast test runner with Jest-compatible API
- **@testing-library/react** - Simple and complete testing utilities for React components
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing
- **@testing-library/user-event** - Simulate user interactions
- **jsdom** - DOM implementation for Node.js (used as test environment)

### Writing Tests

#### Testing Utility Functions

```typescript
import { describe, expect, it } from "vitest";
import { formatNumber } from "../utils/formatNumber";

describe("formatNumber", () => {
  it("should format numbers with commas", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
  });
});
```

#### Testing React Hooks

```typescript
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCalculations } from "../hooks/useCalculations";

describe("useCalculations", () => {
  it("should return calculation results", () => {
    const { result } = renderHook(() => useCalculations(defaultData));
    expect(result.current.results).toBeDefined();
  });
});
```

#### Testing React Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render and handle user interaction', async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();

    render(<MyComponent onClick={onClickMock} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### Configuration

The test configuration is defined in:

- `vitest.config.ts` - Main Vitest configuration
- `src/test/setup.ts` - Global test setup file

### Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the user sees and experiences
2. **Use Descriptive Test Names** - Tests should read like specifications
3. **Arrange, Act, Assert** - Structure tests clearly
4. **Mock External Dependencies** - Keep tests isolated and fast
5. **Test Edge Cases** - Include error conditions and boundary values

### Coverage

Run `npm run test:coverage` to generate a coverage report. The report will be available in the `coverage/` directory.

### CI/CD Integration

Add this to your CI pipeline:

```bash
npm ci
npm run test:run
npm run test:coverage
```

This ensures all tests pass and maintains coverage standards before deployment.
