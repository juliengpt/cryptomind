@echo off
setlocal
cd /d "C:\Users\v2cloud\Documents\Landing-page"
echo [%date% %time%] === run started ===
"C:\Program Files\Git\cmd\git.exe" pull --rebase --autostash --quiet
cd /d "C:\Users\v2cloud\Documents\Landing-page\seo-engine"
"C:\Program Files\nodejs\node.exe" cron-runner.js
cd /d "C:\Users\v2cloud\Documents\Landing-page"
"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" diff --cached --quiet && (echo [%date% %time%] no changes) || ("C:\Program Files\Git\cmd\git.exe" commit -m "Auto-publish %date% %time%" && "C:\Program Files\Git\cmd\git.exe" push origin master)
echo [%date% %time%] === run finished ===
