# Maxi Planner

A comprehensive portfolio analysis and planning tool built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📁 Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── charts/         # Chart and visualization components
│   ├── common/         # Reusable UI components
│   ├── forms/          # Form components and inputs
│   ├── results/        # Result display components
│   └── sections/       # Major form sections
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── services/           # Business logic and data services
├── store/              # State management (centralized store)
├── utils/              # Utility functions and shared helpers
│   └── shared/         # Cross-cutting concerns and reusable utilities
└── test/               # Test utilities and setup
```

## 🧪 Testing

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Generate coverage report
npm run test:ui       # Open test UI dashboard
```

## 🏗️ Development

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind CSS
- **State Management**: Custom centralized store with React context

## 📚 Documentation

- [Development Guide](./docs/development/DEVELOPMENT.md)
- [Testing Guide](./docs/development/TESTING.md)
- [Refactoring History](./docs/refactoring/)

## 🔧 Key Features

- **Portfolio Configuration**: Multi-section form for investment planning
- **Economic Scenarios**: Configurable market assumption modeling
- **Allocation Management**: Dynamic portfolio allocation with visual feedback
- **Rate Generation**: Advanced rate calculation engines for different scenarios
- **Interactive Charts**: Real-time visualization of portfolio performance
- **Comprehensive Testing**: 497+ tests ensuring reliability

## 🎯 Architecture Highlights

- **Shared Utility System**: Reusable hooks and utilities in `utils/shared/`
- **Centralized State**: Predictable state management with context and reducers
- **Service Layer**: Clean separation of business logic from UI components
- **Type Safety**: Comprehensive TypeScript coverage throughout
- **Modular Components**: Well-organized component structure for maintainability
