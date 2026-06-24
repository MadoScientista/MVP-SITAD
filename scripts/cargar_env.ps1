<#
.SYNOPSIS
    Configura las variables de entorno necesarias para ejecutar SITAD en local.
.DESCRIPTION
    - Copia .env.example a .env si no existe
    - Genera un JWT_SECRET válido si está vacío
    - Carga las variables en la terminal actual
#>

$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
$envExample = Join-Path (Split-Path $PSScriptRoot -Parent) ".env.example"

if (-not (Test-Path -LiteralPath $envFile)) {
    if (Test-Path -LiteralPath $envExample) {
        Copy-Item -LiteralPath $envExample -Destination $envFile
        Write-Host "✓ Archivo .env creado desde .env.example" -ForegroundColor Green
    } else {
        Write-Host "✗ No se encuentra .env.example" -ForegroundColor Red
        exit 1
    }
}

$content = Get-Content -LiteralPath $envFile
$modified = $false

for ($i = 0; $i -lt $content.Count; $i++) {
    if ($content[$i] -match '^JWT_SECRET=changeme$') {
        $newSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
        $content[$i] = "JWT_SECRET=$newSecret"
        $modified = $true
        Write-Host "  ✓ JWT_SECRET generado automáticamente" -ForegroundColor Green
    }
    if ($content[$i] -match '^DB_PASSWORD=changeme$') {
        $content[$i] = "DB_PASSWORD=SitadDb2026!"
        $modified = $true
        Write-Host "  ✓ DB_PASSWORD configurado" -ForegroundColor Green
    }
    if ($content[$i] -match '^MYSQL_ROOT_PASSWORD=changeme$') {
        $content[$i] = "MYSQL_ROOT_PASSWORD=root"
        $modified = $true
        Write-Host "  ✓ MYSQL_ROOT_PASSWORD configurado" -ForegroundColor Green
    }
    if ($content[$i] -match '^ADMIN_PASSWORD=changeme$') {
        $content[$i] = "ADMIN_PASSWORD=Admin2026!"
        $modified = $true
        Write-Host "  ✓ ADMIN_PASSWORD configurado" -ForegroundColor Green
    }
    if ($content[$i] -match '^INSPECTOR_PASSWORD=changeme$') {
        $content[$i] = "INSPECTOR_PASSWORD=Inspector2026!"
        $modified = $true
        Write-Host "  ✓ INSPECTOR_PASSWORD configurado" -ForegroundColor Green
    }
}

if ($modified) {
    $content | Set-Content -LiteralPath $envFile
    Write-Host "✓ Archivo .env actualizado con valores por defecto" -ForegroundColor Green
} else {
    Write-Host "→ Archivo .env ya estaba configurado" -ForegroundColor Yellow
}

# Cargar variables en la sesión actual
foreach ($line in $content) {
    if ($line -match '^([^#].+?)=(.+)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

Write-Host "`n✓ Variables de entorno cargadas en esta terminal" -ForegroundColor Green
Write-Host "  (válidas solo mientras esta terminal esté abierta)`n" -ForegroundColor Gray
