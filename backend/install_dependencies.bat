@echo off
echo Installing Python dependencies for TrueText backend...
echo.

REM Install Python packages
pip install -r requirements.txt

echo.
echo Installing Tesseract OCR...
echo Note: You may need to install Tesseract OCR separately on your system.
echo Download from: https://github.com/UB-Mannheim/tesseract/wiki
echo.

echo Installation complete!
echo.
echo To start the server, run: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
