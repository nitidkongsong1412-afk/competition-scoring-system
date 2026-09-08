@echo off
chcp 65001 >nul
title ระบบบันทึกคะแนนการประกวด - เท่อย่างเซียน

echo ======================================================================
echo    กำลังเริ่มต้นระบบบันทึกคะแนนการประกวด "เท่อย่างเซียน"...
echo ======================================================================
echo.

set PATH=C:\Program Files\nodejs;%PATH%;%APPDATA%\npm;%LOCALAPPDATA%\Programs\nodejs

:: Find local IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo ----------------------------------------------------------------------
echo  ช่องทางการเข้าใช้งานระบบ:
echo ----------------------------------------------------------------------
echo  [1] สำหรับเครื่องนี้ (เครื่องหลัก):
echo      👉 http://localhost:3000
echo.
echo  [2] สำหรับ iPad / แท็บเล็ต / มือถือกรรมการ (ต่อ Wi-Fi เดียวกัน):
echo      👉 http://%LOCAL_IP%:3000
echo ----------------------------------------------------------------------
echo  * ข้อแนะนำ: กรรมการสามารถเปิดลิงก์ด้านบนผ่านมือถือ/iPad ได้ทันที
echo  * คำเตือน: กรุณาอย่าปิดหน้าต่างนี้ขณะที่กำลังใช้งานระบบ
echo ======================================================================
echo.

:: Open browser automatically after 3 seconds
start "" "http://localhost:3000"

:: Start Next.js dev server on 0.0.0.0
call npm.cmd run dev
pause
