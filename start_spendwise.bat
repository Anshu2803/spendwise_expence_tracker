@echo off
echo ====================================================
echo Starting Spendwise Frontend and Backend concurrently
echo ====================================================

REM Start Backend in a new window
start "Spendwise Backend" cmd /c "cd spendwise-backend && .\venv_313\Scripts\Activate.bat && uvicorn main:app --reload --port 8000"

REM Start Frontend in a new window
start "Spendwise Frontend" cmd /c "cd spendwise-frontend && npm run dev"

echo Both servers are starting...
echo - Backend (FastAPI) will be available at http://localhost:8000
echo - Frontend (React) will be available at http://localhost:5173
echo.
echo Press any key to exit this launcher (servers will keep running in their own windows).
pause > nul