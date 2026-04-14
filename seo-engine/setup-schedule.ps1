# Setup Windows Task Scheduler to run auto-hourly.js every hour
# Run as Administrator: powershell -ExecutionPolicy Bypass -File setup-schedule.ps1

$TaskName = "CryptoMind-HourlyPublish"
$ScriptDir = "C:\Users\v2cloud\Documents\Landing-page\seo-engine"
$NodePath = (Get-Command node).Source
$LogPath = "$ScriptDir\data\scheduler.log"

Write-Host "Setting up hourly task: $TaskName"
Write-Host "Script: $ScriptDir\auto-hourly.js"
Write-Host "Node: $NodePath"

# Remove existing task if present
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Action: run node auto-hourly.js, redirect output to log
$Action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "auto-hourly.js" `
    -WorkingDirectory $ScriptDir

# Trigger: every hour, starting now, indefinite
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

# Settings: allow on battery, start even if missed, don't stop on idle
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# Register
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Auto-publish 1 SEO article/hour with images + GSC submission" `
    -RunLevel Highest

Write-Host "`nTask created! View with:"
Write-Host "  Get-ScheduledTask -TaskName $TaskName"
Write-Host "`nTo test immediately:"
Write-Host "  Start-ScheduledTask -TaskName $TaskName"
Write-Host "`nTo stop/remove:"
Write-Host "  Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
