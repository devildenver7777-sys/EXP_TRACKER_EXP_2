@echo off
echo ==============================================
echo  Starting Expense Tracker Django Backend API
echo ==============================================
cd backend
set PYTHONPATH=.
"C:\Users\yuvan\AppData\Roaming\ProjectLightningV5\resources\binaries\win\python\python.exe" manage.py runserver 127.0.0.1:8000
pause
