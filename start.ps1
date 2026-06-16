[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"

Set-Location $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm not found. Please install Node.js and npm first." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
  Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

Write-Host "Starting frontend on http://localhost:8080 ..." -ForegroundColor Cyan
npm run serve
exit $LASTEXITCODE
