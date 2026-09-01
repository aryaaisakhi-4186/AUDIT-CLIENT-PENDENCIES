@echo off
title Auto Push to GitHub - M/S. ARYA ASSOCIATES Audit App
echo ========================================================
echo  Auto-Syncing Code to GitHub Repository...
echo ========================================================
cd /d "%~dp0"
git add .
git commit -m "Auto-update: Latest features and enhancements"
git branch -M main
git push -u origin main --force
echo.
echo ========================================================
echo  SUCCESS: All files have been pushed to GitHub!
echo ========================================================
pause
