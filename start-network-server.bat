@echo off
echo Starting BoardGame Timer Network Server...
echo.

cd /d "%~dp0frontend"

echo Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set ip=%%a
    goto :found
)

:found
set ip=%ip: =%
echo.
echo ========================================
echo   BoardGame Timer Network Server
echo ========================================
echo.
echo Your IP Address: %ip%
echo.
echo Desktop: http://localhost:8000
echo iPad:    http://%ip%:8000
echo.
echo Make sure Windows Firewall allows Python!
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m http.server 8000 --bind 0.0.0.0
pause