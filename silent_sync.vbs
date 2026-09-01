Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c push_to_github.bat", 0, False
