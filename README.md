# Finance Dashboard UI

A responsive finance dashboard built with React, TypeScript, and Vite for a frontend internship assignment.

## Overview

This project simulates a personal finance dashboard that helps users:

- Review a high-level financial summary
- Explore transactions with search, filters, and sorting
- Understand spending patterns with charts and insights
- See frontend-only role-based behavior for `Viewer` and `Admin`

## Features

- Summary cards for total balance, total income, and total expenses
- Time-based balance trend visualization with `Recharts`
- Categorical spending breakdown chart
- Search, filter, and sort controls for transactions
- Simulated role switching:
  - `Viewer` can browse data in read-only mode
  - `Admin` can add, edit, and delete transactions (delete confirms before removing)
- Amounts shown in **INR** (Indian Rupees) via `Intl` formatting
- Insights section showing top spending category and monthly comparison
- Responsive layout: fluid grids, stacked filters on small screens, safe-area padding, and a card layout for recent activity that stays aligned on narrow viewports
- Graceful empty states when filters return no results
- Local storage persistence for transactions, selected role, and theme
- Optional dark mode toggle

## Tech Stack

- React 19
- TypeScript
- Vite
- Recharts
- Lucide React

## State Management Approach

The app uses React state and memoized derived values to keep the implementation simple and readable:

- `transactions` stores the source financial data
- `role` controls simulated role-based UI behavior
- `theme` stores the selected light or dark mode
- `search`, `typeFilter`, `categoryFilter`, and `sortBy` manage transaction exploration
- Derived summary values, chart datasets, and insights are computed with `useMemo`

This approach keeps the app lightweight while still separating raw state from calculated UI state.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Create a production build:

```bash
npm run build
```

## Publish to GitHub

Repository name on GitHub: **`frontend-interview`** (hyphens; spaces are not allowed in repo names).

This project is already a **git** repo with an initial commit on branch **`main`**. To create the remote repository and push (one-time):

1. Install [GitHub CLI](https://cli.github.com/) if needed, then sign in:

```bash
gh auth login
```

Follow the prompts (browser login is typical).

2. From the project folder, create the repo and push:

```bash
cd "path/to/frontend assignment"
gh repo create frontend-interview --public --source=. --remote=origin --push
```

If `frontend-interview` already exists on your account as an **empty** repo, add the remote and push instead:

```bash
git remote add origin https://github.com/YOUR_USERNAME/frontend-interview.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Notes

- The dashboard uses static mock data and does not depend on a backend.
- Changes made through the admin form persist in the browser via local storage.
- The project is intentionally scoped as a polished frontend assignment rather than a production financial system.
