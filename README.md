# BudgetFlow

BudgetFlow is a mobile-first personal finance app built with Expo and React Native. It helps you track income and expenses, manage budgets, organize categories, and review spending trends in one place.

## What it does

- Track transactions with income and expense types
- Create and manage monthly budgets by category
- Add custom categories alongside built-in defaults
- Review dashboard totals, recent activity, and net balance
- Explore analytics with date ranges and category-level spending breakdowns
- Switch languages and currencies to match your preferences
- Back up and restore app data as JSON for safe transfer between devices

## Tech stack

- Expo SDK 57
- React Native 0.86
- Expo Router for navigation
- TypeScript
- Shopify Restyle for theming
- MMKV for local persistence
- i18next for multilingual support

## Project structure

```text
src/
  app/                  # screens and route definitions
  core/                 # app state, persistence, i18n, theming
  features/
    analytics/          # analytics calculations and UI
    budgets/            # budget management
    dashboard/          # home/dashboard screen
    onboarding/         # onboarding flow
    settings/           # backup, restore, preferences
    transactions/       # transaction logic and categories
  shared/               # reusable UI, hooks, and helpers
```

## Getting started

### Prerequisites

- Node.js 20+
- npm or bun
- iOS Simulator, Android Emulator, or Expo Go

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npm start
```

This launches Expo. From the terminal menu, you can choose to open:

- the app in an iOS simulator
- the app in an Android emulator
- the app in a web browser
- Expo Go on a device

### Run platform-specific commands

```bash
npm run android
npm run ios
npm run web
```

### Linting

```bash
npx expo lint
```

## Application flow

1. Complete onboarding with your name and preferred language.
2. Add transactions from the transactions screen.
3. Set monthly budgets and custom categories as needed.
4. Review your live balance and recent activity on the dashboard.
5. Use analytics to compare spending across time periods and categories.
6. Export or import a JSON backup from settings when you want to migrate data.

## Data storage and backups

BudgetFlow stores app state locally using MMKV and supports JSON backup/restore for your transactions, budgets, categories, profile, and settings. This makes the app useful for personal budgeting without needing a remote backend.

## Notes

This project is a standalone mobile budgeting app rather than a default Expo starter. It is tailored to the BudgetFlow experience and is ready for local development and iteration.
