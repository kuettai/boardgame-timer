@echo off
echo Starting BoardGame Timer Local Server...
echo.

cd /d "%~dp0frontend"

echo Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    goto :found
)

:found
set ip=%ip: =%
echo.
echo ========================================
echo   BoardGame Timer Server Starting
echo ========================================
echo.
echo Local:    http://localhost:8000
echo Network:  http://%ip%:8000
echo.
echo On your iPad, go to: http://%ip%:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m http.server 8000
pause