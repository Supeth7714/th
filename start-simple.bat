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
echo ========================================
echo 서버가 시작되면 아래 주소로 접속하세요:
echo.
echo          http://localhost:3000
echo.
echo ========================================
echo.
echo [중요] 이 메시지가 나타난 후:
echo        "Server is running on http://localhost:3000"
echo        위 메시지를 확인하고 브라우저에서 접속하세요!
echo.
echo 종료하려면 이 창에서 Ctrl+C를 누르세요.
echo.

REM 서버 시작 (브라우저 자동 실행 없음)
call npm start
