@echo off
cd /d "%~dp0"
git add .
git commit -m "Auto-update: Latest features and enhancements"
git branch -M main
git push -u origin main --force
exit 0
