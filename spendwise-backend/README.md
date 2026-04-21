# Spendwise Backend

## Setup
1. Create `.env` from `.env.example`
2. Add your Supabase URL and anon key
3. `pip install -r requirements.txt`
4. `uvicorn main:app --reload --port 8000`

## Database
Uses Supabase PostgreSQL with NUMERIC(12,2) for amounts (safe money handling).

## Key Features
- Idempotent expense creation (via UUID deduplication)
- Category filtering
- Date sorting (newest first)