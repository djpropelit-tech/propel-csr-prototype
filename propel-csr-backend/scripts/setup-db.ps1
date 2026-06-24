# Creates propel_csr database and propel user for local development.
# Usage (PowerShell):
#   .\scripts\setup-db.ps1 -PostgresPassword "YOUR_POSTGRES_PASSWORD"

param(
  [Parameter(Mandatory = $true)]
  [string]$PostgresPassword
)

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $psql)) {
  $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $found) { throw "psql.exe not found. Install PostgreSQL first." }
  $psql = $found.FullName
}

$env:PGPASSWORD = $PostgresPassword

Write-Host "Connecting as postgres..."
& $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -c "SELECT version();"

$roleExists = (& $psql -U postgres -h localhost -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname = 'propel'").Trim()
if ($roleExists -ne "1") {
  Write-Host "Creating role propel..."
  & $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -c "CREATE ROLE propel LOGIN PASSWORD 'propel';"
} else {
  Write-Host "Role propel already exists."
}

$dbExists = (& $psql -U postgres -h localhost -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'propel_csr'").Trim()
if ($dbExists -ne "1") {
  Write-Host "Creating database propel_csr..."
  & $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE propel_csr OWNER propel;"
} else {
  Write-Host "Database propel_csr already exists."
}

& $psql -U postgres -h localhost -d propel_csr -v ON_ERROR_STOP=1 -c "GRANT ALL ON SCHEMA public TO propel;"
& $psql -U postgres -h localhost -d propel_csr -v ON_ERROR_STOP=1 -c "ALTER DATABASE propel_csr OWNER TO propel;"

Write-Host ""
Write-Host "Done. Next run from propel-csr-backend:"
Write-Host "  npm run setup"
Write-Host "  npm run dev"
