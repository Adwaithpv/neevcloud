# Smart Expense Splitter

A lightweight React + TypeScript web app to manage shared group expenses with:
- group and member management
- equal or custom expense splitting
- real-time balance and debt simplification
- settlement tracking
- AI-powered expense categorization and spending insights

## Tech Stack
- React + Vite + TypeScript
- LocalStorage for persistence
- Vitest for unit testing
- Optional OpenAI API integration from the client

## Features
1. **Group Setup**
   - Create groups
   - Add members to each group
   - Switch between groups

2. **Expense Tracking**
   - Add expense description, amount, payer, participants
   - Split equally or provide custom per-person amounts
   - Validate custom totals before saving

3. **Balance Calculation**
   - Auto-calculate per-member net balances
   - Show simplified `who owes whom` transfers
   - Record settlements to adjust balances in real-time

4. **AI Enhancements**
   - Category prediction from expense descriptions
   - Spending insights generated from grouped expense patterns
   - Deterministic fallback when API key is unavailable

## Project Structure
- `src/types/expense.ts` - domain models
- `src/lib/split.ts` - split and validation logic
- `src/lib/balance.ts` - balance and debt simplification engine
- `src/lib/insights.ts` - analytics summary and fallback insights
- `src/store/useExpenseStore.ts` - app state and persistence logic
- `src/services/ai.ts` - categorization + AI insights layer
- `src/components/*` - UI modules
- `src/lib/__tests__/*` - unit tests for core math logic

## Setup
1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `copy .env.example .env`
3. Add your key (optional):
   - `VITE_OPENAI_API_KEY=...`
4. Start the app:
   - `npm run dev`

## Scripts
- `npm run dev` - start development server
- `npm run build` - type-check and production build
- `npm run lint` - lint code
- `npm run test` - watch tests
- `npm run test:run` - run tests once

## Deployment

### Vercel
1. Import repository in Vercel
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars from `.env` in Vercel project settings

### Netlify
1. Import repository in Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env vars from `.env` in Netlify site settings

## Architecture Notes
- Core financial logic is isolated from UI to keep behavior testable.
- Splits are computed at cent-level precision to reduce rounding drift.
- Balances are simplified into minimum transfers for clearer settlement output.
- AI service is optional and fault-tolerant via deterministic fallbacks.

## Demo Checklist (<= 5 min video)
1. Create group and members
2. Add equal split expense
3. Add custom split expense
4. Show live balances and debt summary
5. Record a settlement
6. Show category chips and AI insights panel
7. Mention deployment URL
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
