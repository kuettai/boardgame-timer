@echo off
cd /d "%~dp0frontend"
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop (may need to close window)
python -m http.server 8000 --bind 0.0.0.0
pause