Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\user\Desktop\PEA FITS\pea-fits"
WshShell.Run "npm run dev", 0, False
