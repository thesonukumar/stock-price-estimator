Write-Output "[+] Starting Backend"
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload"
cd ..

Write-Output "[+] Starting Frontend"
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
cd ..

Write-Output "Initializing project"
Start-Sleep -Seconds 2

Write-Output "Opening project"
Start-Process "http://localhost:5173/"
