@echo off
echo ===================================================
echo        Starting ShopSphere Full-Stack Application
echo ===================================================

start "ShopSphere Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"
start "ShopSphere Frontend (React/Vite)" cmd /k "cd frontend && npm run dev"

echo Backend API: http://localhost:8000/docs
echo Frontend UI: http://localhost:3000
echo Admin Login: admin@shopsphere.com / Admin@123456
echo Customer Login: john@example.com / Password@123
pause

