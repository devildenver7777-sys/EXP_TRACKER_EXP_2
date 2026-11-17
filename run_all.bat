@echo off
echo ==============================================
echo  Launching Expense Tracker Full Stack App
echo ==============================================
start "Expense Tracker Backend (Django)" run_backend.bat
start "Expense Tracker Frontend (React Vite)" run_frontend.bat
echo Both services are starting...
echo Frontend will be accessible at: http://localhost:5173
echo Backend API will be accessible at: http://127.0.0.1:8000/api/
pause
