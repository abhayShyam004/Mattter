@echo off
echo Starting Mattter Frontend...
cd mattter-frontend

echo Installing dependencies...
call npm install

echo Starting Vite Server...
call npm run dev
pause
