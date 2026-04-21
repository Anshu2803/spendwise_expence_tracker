# Spendwise Personal Finance Tracker

## Overview

Spendwise is a full-stack personal finance tool that allows users to record and review their personal expenses. It is designed to handle **real-world conditions** like unreliable networks, browser refreshes, and accidental double-clicks by strictly enforcing **request idempotency**.

This project was built using **Next.js App Router** with **Supabase** for both authentication and database, consolidating what was originally a split frontend/backend architecture into a unified single application.

## How This Project Was Built

This project went through several iterations to reach its current state:

1. **Research Phase (Claude Haiku)**: Used Claude Haiku for in-depth reasoning about the assignment requirements, understanding idempotency, safe money handling, and architectural trade-offs.

2. **Initial Build (Stitch + MCP)**: Originally designed using Stitch and configured via remote MCP method to connect directly to Supabase as the backend-as-a-service.

3. **Architecture Pivot**: Later pivoted to a **separate FastAPI + React** structure to strictly satisfy the assignment's "separated backend API and frontend UI" requirement.

4. **Final Consolidation**: Refactored into a **single Next.js application** using App Router (frontend UI in `page.tsx`, backend API in `route.ts`), which is the current implementation.

5. **Multi-User Support**: Added Supabase Authentication to support multiple users, each seeing only their own expenses.

---

## Assignment Alignment & Key Features

This project fulfills the full criteria of the technical assignment:

### 1. Idempotency & Data Correctness (Network Reliability)
- **Frontend**: Generates a unique UUID (`idempotency_key`) on component mount.
- **Backend API**: Accepts the `idempotency_key` and attempts an `INSERT`.
- **Database**: Enforces a `UNIQUE` constraint on the `idempotency_key` column.
- **Result**: If the user clicks "Submit" multiple times rapidly, or refreshes the page and resubmits, the API catches the `UNIQUE` constraint violation (`23505`) and returns a `200 OK` with the already existing row. **No duplicate charges are created.**

### 2. Safe Money Handling
- **Database**: Amounts stored as `NUMERIC(12,2)` to avoid floating-point precision loss.
- **Backend API**: Validates that amount > 0 using Pydantic (originally) or manual checks.
- **Frontend**: Prevents negative numbers at the HTML input level (`min="0.01"`).

### 3. Feature Completeness
- 📝 **Create**: User records amount, category, description, and date.
- 👁️ **View**: Expense list grouped by date (TODAY, YESTERDAY, etc.).
- 🔍 **Filter**: Filter by category.
- ↕️ **Sort**: Sorted by date (newest first).
- 💰 **Totals**: Dynamic sum of currently visible expenses.
- 🗑️ **Delete**: Remove individual expenses.
- 👤 **Multi-User**: Supabase Auth for user accounts.

---

## Architecture Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Framework** | Next.js 16 (App Router) | Unifies frontend and API into one deployable unit while maintaining clear Frontend/Backend boundary |
| **Database** | Supabase (PostgreSQL) | ACID compliance, native UUIDs, Row Level Security for multi-user isolation |
| **Auth** | Supabase Auth | Built-in email/password auth with secure token management |
| **Money** | NUMERIC(12,2) | Avoids FLOAT precision issues for decimal money values |
| **Idempotency** | UUID + UNIQUE constraint | Server-side deduplication without complex caching |

### Trade-offs Made
- **No separate Python backend**: Originally built with FastAPI, but consolidated to Next.js API routes for simpler deployment.
- **No pagination**: Returns all filtered results at once (production would need cursor-based pagination).
- **No edit/update**: Focus was on ensuring "record" action is bulletproof against network failures.
- **Simplified RLS**: Using JWT validation in API routes rather than relying solely on Supabase RLS for the service role.

---

## Supabase Setup

### Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kdxkvpydmcozdexwdgdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Database Schema

Run this in your Supabase SQL Editor:

```sql
-- Create expenses table with multi-user support
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  idempotency_key UUID UNIQUE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy the example and add your keys
cp .env.local.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Browser
Visit `http://localhost:3000`

---

## Testing the App

### Test A: Basic Create & View
1. Sign up / Sign in
2. Fill form (Amount, Category, Description, Date)
3. Click "Save Expense"
4. Verify it appears in the list

### Test B: Idempotency (Critical)
1. Fill form with a high amount
2. **Click "Save" 4-5 times rapidly**
3. Verify only **one** expense is added (check the Network tab - subsequent requests return 200 OK with existing data)

### Test C: Filtering & Totals
1. Add expenses in different categories
2. Use the category dropdown filter
3. Verify the total at the bottom updates dynamically

### Test D: Delete
1. Hover over an expense row
2. Click the trash icon
3. Confirm deletion

### Test E: Multi-User
1. Create account with email A
2. Add some expenses
3. Sign out, create account with email B
4. Verify account B sees no expenses from A

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set Root Directory to `src` (or deployment root)
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

---

## Project Structure

```
expense_tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── expenses/
│   │   │       └── route.ts      # Backend API (GET, POST, DELETE)
│   │   ├── globals.css          # Tailwind CSS
│   │   ├── layout.tsx         # Root layout with AuthProvider
│   │   └── page.tsx            # Main UI page
│   ├── components/
│   │   ├── AuthPage.tsx       # Sign In / Sign Up UI
│   │   ├── ExpenseForm.tsx    # Add expense form
│   │   ├── ExpenseList.tsx    # Expense list with delete
│   │   ├── FilterBar.tsx      # Category filter
│   │   └── TotalBar.tsx       # Dynamic total display
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   └��─ lib/
│       ├── api.ts              # API client with auth headers
│       ├── supabase-client.ts # Supabase client
│       └── supabase.ts         # Server-side Supabase client
├── .env.local                 # Environment variables
├── package.json
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | Fetch expenses (supports `?category=X&sort=date_desc`) |
| `POST` | `/api/expenses` | Create expense (requires `idempotency_key`) |
| `DELETE` | `/api/expenses?id=X` | Delete expense |

All endpoints require `Authorization: Bearer <token>` header for authenticated users.

---

## Key Files

- **`src/app/api/expenses/route.ts`**: Backend API handling GET, POST, DELETE with JWT validation
- **`src/components/ExpenseForm.tsx`**: Frontend form with UUID generation and idempotency handling
- **`src/context/AuthContext.tsx`**: Authentication state using Supabase Auth
- **`src/lib/supabase-client.ts`**: Client for browser-side Supabase operations

---

## License

MIT