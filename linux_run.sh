#!/bin/bash

echo "[+] Starting Backend"
cd backend
gnome-terminal -- bash -c "uvicorn main:app --reload; exec bash"
cd ..

echo "[+] Starting Frontend"
cd front
gnome-terminal -- bash -c "npm run dev; exec bash"
cd ..

echo "Initializing project"
sleep 2

echo "Opening project"
xdg-open "http://localhost:5173/"
#!/bin/bash

echo "[+] Starting Backend"
cd backend
gnome-terminal -- bash -c "uvicorn main:app --reload; exec bash"
cd ..

echo "[+] Starting Frontend"
cd front
gnome-terminal -- bash -c "npm run dev; exec bash"
cd ..

echo "Initializing project"
sleep 2

echo "Opening project"
xdg-open "http://localhost:5173/"
