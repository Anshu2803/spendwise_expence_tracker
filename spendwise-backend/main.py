from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from decimal import Decimal
from datetime import date
from uuid import UUID
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Spendwise API", version="1.0")

# Enable CORS for development (allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Pydantic Models
class ExpenseRequest(BaseModel):
    idempotency_key: UUID
    amount: Decimal = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    description: str = ""
    date: date

    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('amount must be greater than 0')
        return v

    @validator('category')
    def category_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('category cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
                "amount": 450.50,
                "category": "Food",
                "description": "Coffee at Starbucks",
                "date": "2026-04-22"
            }
        }

class ExpenseResponse(BaseModel):
    id: str
    idempotency_key: str
    amount: Decimal
    category: str
    description: str
    date: str
    created_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
                "amount": 450.50,
                "category": "Food",
                "description": "Coffee at Starbucks",
                "date": "2026-04-22",
                "created_at": "2026-04-22T10:30:00+00:00"
            }
        }

class HealthResponse(BaseModel):
    status: str
    version: str

# Health check endpoint
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    return HealthResponse(status="ok", version="1.0")

# POST endpoint — Create expense with idempotency
@app.post("/api/expenses", response_model=ExpenseResponse, status_code=201)
def create_expense(payload: ExpenseRequest):
    """
    Create a new expense.
    
    Handles retries via idempotency_key:
    - If same idempotency_key is sent again, returns existing record (200)
    - Otherwise creates new record (201)
    """
    try:
        # Convert UUID to string for database
        idempotency_key_str = str(payload.idempotency_key)
        
        # Prepare data for insertion
        expense_data = {
            "idempotency_key": idempotency_key_str,
            "amount": float(payload.amount),
            "category": payload.category,
            "description": payload.description,
            "date": str(payload.date)
        }
        
        # Try to insert
        response = supabase.table("expenses").insert(expense_data).execute()
        
        # Return newly created expense
        if response.data and len(response.data) > 0:
            expense = response.data[0]
            return ExpenseResponse(
                id=expense['id'],
                idempotency_key=expense['idempotency_key'],
                amount=Decimal(str(expense['amount'])),
                category=expense['category'],
                description=expense['description'],
                date=expense['date'],
                created_at=expense['created_at']
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to create expense")
    
    except Exception as e:
        # Check if it's a unique constraint violation (idempotency_key already exists)
        if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
            # Fetch existing expense with this idempotency_key
            try:
                response = supabase.table("expenses").select("*").eq(
                    "idempotency_key", str(payload.idempotency_key)
                ).execute()
                
                if response.data and len(response.data) > 0:
                    expense = response.data[0]
                    return ExpenseResponse(
                        id=expense['id'],
                        idempotency_key=expense['idempotency_key'],
                        amount=Decimal(str(expense['amount'])),
                        category=expense['category'],
                        description=expense['description'],
                        date=expense['date'],
                        created_at=expense['created_at']
                    )
            except:
                raise HTTPException(status_code=409, detail="Expense already exists")
        
        # Other errors
        raise HTTPException(status_code=500, detail=str(e))

# GET endpoint — Fetch expenses with optional filtering and sorting
@app.get("/api/expenses", response_model=list[ExpenseResponse])
def get_expenses(category: str = None, sort: str = "date_desc"):
    """
    Fetch all expenses with optional filtering.
    
    Query Parameters:
    - category: Filter by category (e.g., "Food")
    - sort: Sort order — "date_desc" for newest first (default)
    """
    try:
        # Build query
        query = supabase.table("expenses").select("*")
        
        # Apply category filter if provided
        if category and category.strip():
            query = query.eq("category", category.strip())
        
        # Apply sorting
        if sort == "date_desc":
            query = query.order("date", desc=True)
            query = query.order("created_at", desc=True)
        else:
            query = query.order("created_at", desc=True)
        
        # Execute query
        response = query.execute()
        
        # Convert response to ExpenseResponse list
        expenses = []
        if response.data:
            for expense in response.data:
                expenses.append(ExpenseResponse(
                    id=expense['id'],
                    idempotency_key=expense['idempotency_key'],
                    amount=Decimal(str(expense['amount'])),
                    category=expense['category'],
                    description=expense['description'],
                    date=expense['date'],
                    created_at=expense['created_at']
                ))
        
        return expenses
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import JSONResponse
# Error handler for validation errors
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": str(exc)})