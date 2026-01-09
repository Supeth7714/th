@echo off
chcp 65001 > nul
echo ========================================
echo MRO 업무 관리 프로그램 설치
echo ========================================
echo.

REM Node.js 설치 확인
echo [1/3] Node.js 설치 확인 중...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo.
    echo Node.js를 먼저 설치해주세요:
    echo https://nodejs.org/
    echo.
    echo LTS 버전(왼쪽 버튼)을 다운로드하여 설치하세요.
    echo.
    pause
    exit /b 1
)
echo Node.js 설치 확인 완료!
node --version

echo.
echo [2/3] 필요한 패키지 설치 중...
echo (시간이 조금 걸릴 수 있습니다)
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [오류] 패키지 설치 중 문제가 발생했습니다.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] 데이터베이스 초기화 중...
call npm run init-db
if %errorlevel% neq 0 (
    echo.
    echo [오류] 데이터베이스 초기화 중 문제가 발생했습니다.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 설치가 완료되었습니다!
echo ========================================
echo.
echo 이제 start.bat 파일을 실행하여 프로그램을 시작하세요.
echo.
pause
