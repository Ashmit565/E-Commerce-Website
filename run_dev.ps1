Write-Host "===================================================" -ForegroundColor Magenta
Write-Host "       Starting ShopSphere Full-Stack Application   " -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Magenta

# Check virtual environment
if (-not (Test-Path "backend\venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
    .\backend\venv\Scripts\pip.exe install -r backend\requirements.txt
}

Write-Host "Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Vite React Frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nBoth services launched!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "- Admin Demo Login: admin@shopsphere.com / Admin@123456" -ForegroundColor Yellow
Write-Host "- Customer Demo Login: john@example.com / Password@123" -ForegroundColor Yellow

