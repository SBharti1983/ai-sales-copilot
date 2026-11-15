@echo off
cd /d "%~dp0"
echo ===================================================
echo Pushing AI Sales Copilot to GitHub (SBharti1983)...
echo ===================================================
echo Current Directory: %CD%
git branch -M main
git remote set-url origin https://github.com/SBharti1983/ai-sales-copilot.git
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo [SUCCESS] Code pushed to GitHub successfully!
    echo Visit: https://github.com/SBharti1983/ai-sales-copilot
    echo ===================================================
) else (
    echo ===================================================
    echo [NOTE] If a browser login window opened, please
    echo authorize GitHub and then press any key to retry.
    echo ===================================================
)
echo.
pause
