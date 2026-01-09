@echo off
chcp 65001 > nul
echo ========================================
echo MRO 업무 관리 프로그램 시작
echo ========================================
echo.

REM Node.js 설치 확인
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo install.bat을 먼저 실행해주세요.
    echo.
    pause
    exit /b 1
)

REM node_modules 존재 확인
if not exist "node_modules" (
    echo [오류] 필요한 패키지가 설치되어 있지 않습니다!
    echo install.bat을 먼저 실행해주세요.
    echo.
    pause
    exit /b 1
)

echo 서버를 시작합니다...
echo.
echo 프로그램 접속 주소: http://localhost:3000
echo.
echo 종료하려면 이 창에서 Ctrl+C를 누르세요.
echo.
echo ========================================
echo.

REM 5초 후 브라우저 자동 실행
start "" cmd /c "timeout /t 5 /nobreak > nul && start http://localhost:3000"

REM 서버 시작
call npm start
