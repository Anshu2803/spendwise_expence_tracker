# Spendwise Personal Finance Tracker

## Overview
Spendwise is a full-stack personal finance tool that allows users to record and review their personal expenses. It is designed to handle real-world conditions like unreliable networks, browser refreshes, and double-clicks by strictly enforcing request idempotency.

The stack consists of a **React + Vite** frontend and a **FastAPI + Supabase (PostgreSQL)** backend API.

## Assignment Alignment & Key Features
This project fulfills the full criteria of the assignment, prioritizing correctness, clarity, and resilient engineering.

1. **Idempotency & Data Correctness (Network Reliability):**
   - **Frontend:** Generates a unique UUID (`idempotency_key`) on component mount. This UUID is locked to the specific form session.
   - **Backend API:** Accepts the `idempotency_key` and attempts an `INSERT`. 
   - **Database (Supabase):** Enforces a `UNIQUE` constraint on the `idempotency_key` column.
   - **Result:** If the user clicks "Submit" three times rapidly, or refreshes the page and resubmits because a network timeout hid the initial response, the backend traps the `UNIQUE` constraint violation and returns a `200 OK` with the *already existing row*. No duplicate charges are created.

2. **Safe Money Handling:**
   - **Database:** Amounts are stored as `NUMERIC(12,2)` rather than `FLOAT` or `DOUBLE`. This avoids infamous floating-point precision loss issues.
   - **Backend:** Pydantic strictly validates that the amount is parsed as a Python `Decimal` and is strictly `> 0`.
   - **Frontend:** Prevents negative numbers from being entered at the HTML input level and performs a JS verification before sending.

3. **Feature Completeness:**
   - **Create:** User can record amount, category, description, and date.
   - **View:** User views the expense list, visually grouped by date (`TODAY`, `YESTERDAY`, etc.).
   - **Filter & Sort:** Query parameter-based filtering (by category) and sorting (newest first). Backend safely handles both parameters directly in the SQL translation query.
   - **Totals:** The UI dynamically displays the real-time sum of the *currently visible* (filtered) expenses.

## Design Decisions & Trade-offs

1. **Why FastAPI?** 
   - FastAPI forces the use of Pydantic validation models natively, ensuring that incoming data (like `Decimal` amounts and valid string boundaries) is rigorously type-checked before hitting the database.

2. **Why Supabase (PostgreSQL)?**
   - The assignment permits any reasonable persistence mechanism. Using a managed Postgres database provides industrial-grade guarantees (ACID compliance, Row-Level Security, Native UUIDs) without having to mock local JSON file persistence. 
   - *Trade-off:* It requires an active internet connection to interact with the API, but perfectly emulates real-world latency scenarios required for testing the idempotency feature.

3. **Intentionally Skipped Items:**
   - **Authentication:** Left out to keep the feature set small and focused solely on expense creation and viewing correctness.
   - **Pagination:** The list returns all filtered results at once. In a production scenario with thousands of rows, cursor-based pagination would be necessary.
   - **Edit / Delete:** The assignment solely requested "recording and reviewing". The focus was spent entirely on ensuring the "record" action was bulletproof against network failures.

## Quick Start (Local Development)

### Seamless Launcher (Windows)
A `start_spendwise.bat` file is provided at the root. Double click it to automatically spin up both the FastAPI backend and the React frontend in parallel.

### Manual Start
1. **Backend:**
   ```bash
   cd spendwise-backend
   python -m venv venv
   # activate venv
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
2. **Frontend:**
   ```bash
   cd spendwise-frontend
   npm install
   npm run dev
   ```