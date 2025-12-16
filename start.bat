@echo off
echo Memulai MathSpace Mini Server...
start http://localhost:3000
python -m http.server 3000
pause
