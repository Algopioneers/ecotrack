$ErrorActionPreference = "Stop"
Set-Location "C:\projects\ecotrack-main\frontend"

try {
    $env:NODE_OPTIONS = "--openssl-legacy-provider"
    & node node_modules/next/dist/bin/next dev 2>&1
} catch {
    Write-Host "Error: $_"
}