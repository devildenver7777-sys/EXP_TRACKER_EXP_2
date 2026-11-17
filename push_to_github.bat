@echo off
echo ==========================================================
echo   Pushing Expense Tracker to GitHub Repository
echo   Repo: https://github.com/devildenver7777-sys/EXP_TRACKER_EXP_2.git
echo ==========================================================
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ==========================================================
    echo   SUCCESSFULLY PUSHED TO GITHUB!
    echo ==========================================================
) else (
    echo ==========================================================
    echo   Push failed or was cancelled.
    echo ==========================================================
)
pause
