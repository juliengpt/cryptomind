# Install Windows Task Scheduler task: runs cron-runner.js every hour.
# StartWhenAvailable = true → if the PC was OFF at a scheduled run, it
# launches as soon as the PC boots back up.
#
# Run once as Administrator:
#   powershell -ExecutionPolicy Bypass -File setup-schedule.ps1

$ErrorActionPreference = 'Stop'

# Auto-elevate: if not running as admin, re-launch with UAC prompt
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Not running as admin — re-launching with elevation...'
    Start-Process powershell.exe -Verb RunAs -ArgumentList '-ExecutionPolicy Bypass -File', $MyInvocation.MyCommand.Path
    exit
}

$TaskName    = 'CryptoMind-HourlyPublish'
$ScriptDir   = 'C:\Users\v2cloud\Documents\Landing-page\seo-engine'
$RepoDir     = 'C:\Users\v2cloud\Documents\Landing-page'
$NodePath    = (Get-Command node).Source
$GitPath     = (Get-Command git).Source
$BatPath     = Join-Path $ScriptDir 'run-hourly.bat'
$LogPath     = Join-Path $ScriptDir 'data\scheduler.log'
$CurrentUser = "$env:USERDOMAIN\$env:USERNAME"

Write-Host ''
Write-Host '=== CryptoMind hourly publish scheduler ==='
Write-Host "  Task name  : $TaskName"
Write-Host "  Node       : $NodePath"
Write-Host "  Git        : $GitPath"
Write-Host "  Run as     : $CurrentUser"
Write-Host ''

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Ensure data dir exists for log
New-Item -ItemType Directory -Force -Path (Split-Path $LogPath) | Out-Null

# Write the batch wrapper
$batLines = @(
    '@echo off',
    'setlocal',
    "cd /d `"$RepoDir`"",
    "echo [%date% %time%] === run started ===",
    "`"$GitPath`" pull --rebase --autostash --quiet",
    "cd /d `"$ScriptDir`"",
    "`"$NodePath`" cron-runner.js",
    "cd /d `"$RepoDir`"",
    "`"$GitPath`" add -A",
    "`"$GitPath`" diff --cached --quiet && (echo [%date% %time%] no changes) || (`"$GitPath`" commit -m `"Auto-publish %date% %time%`" && `"$GitPath`" push origin master)",
    "echo [%date% %time%] === run finished ==="
)
$batLines -join "`r`n" | Out-File -FilePath $BatPath -Encoding ASCII -Force

Write-Host "[write] $BatPath"

# Action: cmd /c run-hourly.bat >> scheduler.log 2>&1
$actionArg = "/c `"`"$BatPath`" >> `"$LogPath`" 2>&1`""
$Action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument $actionArg -WorkingDirectory $RepoDir

# Trigger: every hour starting 2 min from now
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

# Settings: StartWhenAvailable catches up missed runs after the PC boots
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 25) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 10) `
    -MultipleInstances IgnoreNew

$Principal = New-ScheduledTaskPrincipal -UserId $CurrentUser -LogonType S4U -RunLevel Highest

$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal `
    -Description 'CryptoMind hourly auto-publish'

Register-ScheduledTask -TaskName $TaskName -InputObject $Task | Out-Null

Write-Host '[OK] Task registered.'
Write-Host ''
Write-Host 'Useful commands:'
Write-Host "  Start now   : Start-ScheduledTask -TaskName $TaskName"
Write-Host "  Show info   : Get-ScheduledTaskInfo -TaskName $TaskName"
Write-Host "  Tail log    : Get-Content `"$LogPath`" -Wait -Tail 40"
Write-Host "  GUI         : taskschd.msc"
Write-Host "  Remove      : Unregister-ScheduledTask -TaskName $TaskName -Confirm:" + '$false'
Write-Host ''
Write-Host 'Missed hourly runs (PC off) auto-launch as soon as the PC boots, thanks to StartWhenAvailable.'
