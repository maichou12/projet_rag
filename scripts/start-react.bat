@echo off
cd /d "%~dp0.."
call venv\Scripts\activate.bat
cd frontend
npm run dev
