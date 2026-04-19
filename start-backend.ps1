$ErrorActionPreference = "Continue"
Set-Location "C:\projects\ecotrack-main\backend"
Write-Host "Starting backend server..."

try {
    node -r ts-node/register src/server.ts
} catch {
    Write-Host "Error: $_"
    Read-Host "Press Enter to exit"
}