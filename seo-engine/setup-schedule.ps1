# Install Windows Task Scheduler task: runs cron-runner.js every hour.
# Key feature: StartWhenAvailable = true → if the PC was OFF during a
# scheduled run, the task launches as soon as the PC boots back up.
#
# Run once as Administrator:
#   powershell -ExecutionPolicy Bypass -File setup-schedule.ps1

$ErrorActionPreference = "Stop"

$TaskName  = "CryptoMind-HourlyPublish"
$ScriptDir = "C:\Users\v2cloud\Documents\Landing-page\seo-engine"
$NodePath  = (Get-Command node).Source
$CurrentUser = "$env:USERDOMAIN\$env:USERNAME"

Write-Host ""
Write-Host "=== CryptoMind hourly publish scheduler ==="
Write-Host "  Task name : $TaskName"
Write-Host "  Node      : $NodePath"
Write-Host "  Script    : $ScriptDir\cron-runner.js"
Write-Host "  Run as    : $CurrentUser"
Write-Host ""

# Remove existing task if present
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Wrapper that pulls latest code, runs cron, commits, pushes — all as a single atomic attempt
$WrapperCmd = @"
cd /d "$ScriptDir\.." && git pull --rebase --autostash --quiet && cd seo-engine && "$NodePath" cron-runner.js && cd .. && git add -A && git diff --cached --quiet || (git commit -m "Auto-publish %date% %time%" && git push origin master)
"@

# Save wrapper to a .bat so Task Scheduler doesn't fight escaping hell
$BatPath = "$ScriptDir\run-hourly.bat"
$WrapperCmd | Out-File -FilePath $BatPath -Encoding ASCII -Force

# Also log output so we can debug
$LaunchCmd = "cmd.exe"
$LaunchArgs = "/c `"$BatPath`" >> `"$ScriptDir\data\scheduler.log`" 2>&1"

$Action = New-ScheduledTaskAction -Execute $LaunchCmd -Argument $LaunchArgs -WorkingDirectory "$ScriptDir\.."

# Trigger:
#   - First fire 1 min from now
#   - Then every 1 hour, forever
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

# Settings:
#   - StartWhenAvailable = critical: runs missed schedules when PC comes back online
#   - AllowStartIfOnBatteries / DontStopIfGoingOnBatteries
#   - ExecutionTimeLimit: kill task if it runs > 25 min (stuck)
#   - RestartCount: retry on failure
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 25) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 10) `
    -MultipleInstances IgnoreNew

# Run as current user with highest privileges
$Principal = New-ScheduledTaskPrincipal -UserId $CurrentUser -LogonType S4U -RunLevel Highest

# Register
$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal `
    -Description "CryptoMind hourly auto-publish — runs cron-runner.js, commits, pushes"

Register-ScheduledTask -TaskName $TaskName -InputObject $Task | Out-Null

Write-Host "[OK] Task registered."
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  Start now        : Start-ScheduledTask -TaskName $TaskName"
Write-Host "  Show status      : Get-ScheduledTaskInfo -TaskName $TaskName"
Write-Host "  View in GUI      : taskschd.msc"
Write-Host "  Remove           : Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
Write-Host "  Tail log         : Get-Content $ScriptDir\data\scheduler.log -Wait -Tail 30"
Write-Host ""
Write-Host "Missed runs (PC off) are automatically launched on next boot thanks to StartWhenAvailable."
