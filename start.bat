@echo off
chcp 65001 >/dev/null
title Yixisi Trade Website Server

echo ========================================
echo   Yixisi Trading Website Server
echo ========================================
echo.
echo  Starting server...
echo  Main site:  http://localhost:3000
echo  Admin panel: http://localhost:3000/admin/
echo.
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
