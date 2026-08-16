Set WshShell = CreateObject("WScript.Shell")

' 1. Clean up stale ports and processes (Wait for completion)
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| find "":3000"" ^| find ""LISTENING""') do taskkill /F /PID %a 2>nul", 0, True
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| find "":5050"" ^| find ""LISTENING""') do taskkill /F /PID %a 2>nul", 0, True
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| find "":5000"" ^| find ""LISTENING""') do taskkill /F /PID %a 2>nul", 0, True
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| find "":8080"" ^| find ""LISTENING""') do taskkill /F /PID %a 2>nul", 0, True
WshShell.Run "taskkill /F /IM node.exe 2>nul", 0, True
WshShell.Run "taskkill /F /IM python.exe 2>nul", 0, True

' 2. Start all services completely hidden in the background
WshShell.Run "cmd /c cd backend && npm run dev", 0, False
WshShell.Run "cmd /c cd frontend && npm run dev", 0, False
' Note: removed --gui flag so python doesn't try to open an OpenCV window which might steal focus
WshShell.Run "cmd /c cd edge-ai && python detector.py", 0, False

' 3. Wait 5 seconds for servers to boot, then open the browser
WScript.Sleep 5000
WshShell.Run "http://localhost:3000", 0, False
